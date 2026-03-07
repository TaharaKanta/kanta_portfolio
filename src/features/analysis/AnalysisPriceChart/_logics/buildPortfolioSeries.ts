import type { HistoricalPricePoint } from "../_actions";

/**
 * ポートフォリオ計算対象の銘柄データ。
 */
export interface PortfolioSeriesInput {
  symbol: string;
  weight: number;
  points: HistoricalPricePoint[];
}

/**
 * ポートフォリオ系列生成結果。
 */
export interface PortfolioSeriesResult {
  points: HistoricalPricePoint[];
  effectiveFrom: string;
  effectiveTo: string;
  availableFrom: string;
  availableTo: string;
}

function sortByDate(points: HistoricalPricePoint[]): HistoricalPricePoint[] {
  return [...points].sort((a, b) => a.date.localeCompare(b.date));
}

function toDateSet(points: HistoricalPricePoint[]): Set<string> {
  return new Set(points.map((point) => point.date));
}

function intersectDates(series: PortfolioSeriesInput[]): string[] {
  if (series.length === 0) {
    return [];
  }

  const [first, ...rest] = series;
  const result = [...toDateSet(first.points)].filter((date) =>
    rest.every((entry) => toDateSet(entry.points).has(date)),
  );

  return result.sort((a, b) => a.localeCompare(b));
}

function clampRange(
  requestedFrom: string,
  requestedTo: string,
  availableFrom: string,
  availableTo: string,
): { from: string; to: string } | null {
  const from = requestedFrom < availableFrom ? availableFrom : requestedFrom;
  const to = requestedTo > availableTo ? availableTo : requestedTo;

  if (from > to) {
    return null;
  }

  return { from, to };
}

export function buildPortfolioSeries(
  series: PortfolioSeriesInput[],
  requestedFrom: string,
  requestedTo: string,
  initialCapital = 100,
): PortfolioSeriesResult | null {
  if (series.length === 0) {
    return null;
  }

  const normalizedSeries = series.map((entry) => ({
    ...entry,
    points: sortByDate(entry.points),
  }));

  const commonDates = intersectDates(normalizedSeries);
  if (commonDates.length === 0) {
    return null;
  }

  const availableFrom = commonDates[0];
  const availableTo = commonDates[commonDates.length - 1];
  const effectiveRange = clampRange(requestedFrom, requestedTo, availableFrom, availableTo);
  if (!effectiveRange) {
    return null;
  }

  const targetDates = commonDates.filter(
    (date) => date >= effectiveRange.from && date <= effectiveRange.to,
  );
  if (targetDates.length === 0) {
    return null;
  }

  const firstDate = targetDates[0];
  const bySymbolDate = new Map<string, Map<string, number>>();
  for (const item of normalizedSeries) {
    bySymbolDate.set(item.symbol, new Map(item.points.map((point) => [point.date, point.close])));
  }

  const basePriceBySymbol = new Map<string, number>();
  for (const item of normalizedSeries) {
    const price = bySymbolDate.get(item.symbol)?.get(firstDate);
    if (!price || price <= 0) {
      return null;
    }
    basePriceBySymbol.set(item.symbol, price);
  }

  const points = targetDates.map((date) => {
    let value = 0;

    for (const item of normalizedSeries) {
      const currentPrice = bySymbolDate.get(item.symbol)?.get(date);
      const basePrice = basePriceBySymbol.get(item.symbol);
      if (!currentPrice || !basePrice) {
        return null;
      }

      value += (item.weight / 100) * (currentPrice / basePrice) * initialCapital;
    }

    return {
      date,
      close: Number(value.toFixed(6)),
    };
  });

  const validPoints = points.filter((point): point is HistoricalPricePoint => point !== null);
  if (validPoints.length === 0) {
    return null;
  }

  return {
    points: validPoints,
    effectiveFrom: effectiveRange.from,
    effectiveTo: effectiveRange.to,
    availableFrom,
    availableTo,
  };
}

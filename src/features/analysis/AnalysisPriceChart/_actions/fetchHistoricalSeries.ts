"use server";

import { FmpApiError, getHistoricalPrices } from "@/server/fmp";
import { buildPortfolioSeries, type PortfolioSeriesInput } from "../_logics/buildPortfolioSeries";
import type {
  HistoricalPriceChartState,
  HistoricalPricePoint,
  PortfolioAllocationInput,
} from "./state";

const MAX_ALLOCATION_COUNT = 3;
const REQUIRED_WEIGHT_TOTAL = 100;

function normalizeSymbol(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
}

function normalizeDate(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function normalizeWeight(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function normalizePoints(points: unknown): HistoricalPricePoint[] {
  if (!Array.isArray(points)) {
    return [];
  }

  return points
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const date = "date" in item && typeof item.date === "string" ? item.date : null;
      const close = "close" in item && typeof item.close === "number" ? item.close : null;
      if (!date || !Number.isFinite(close)) {
        return null;
      }

      return { date, close };
    })
    .filter((item): item is HistoricalPricePoint => item !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function parseAllocations(formData: FormData): PortfolioAllocationInput[] {
  const allocations: PortfolioAllocationInput[] = [];

  for (let index = 1; index <= MAX_ALLOCATION_COUNT; index += 1) {
    const symbol = normalizeSymbol(formData.get(`symbol${index}`));
    const weight = normalizeWeight(formData.get(`weight${index}`));

    const isEmptyRow = !symbol && (weight === null || weight === 0);
    if (isEmptyRow) {
      continue;
    }

    if (!symbol || weight === null) {
      throw new Error(`ポートフォリオ ${index} 行目の入力が不完全です。`);
    }

    if (weight <= 0) {
      throw new Error(`ポートフォリオ ${index} 行目の比率は 0 より大きくしてください。`);
    }

    allocations.push({
      symbol,
      weight,
    });
  }

  if (allocations.length === 0) {
    throw new Error("少なくとも1つのシンボルを入力してください。");
  }

  const symbolSet = new Set<string>();
  for (const allocation of allocations) {
    if (symbolSet.has(allocation.symbol)) {
      throw new Error(`シンボル ${allocation.symbol} が重複しています。`);
    }
    symbolSet.add(allocation.symbol);
  }

  const totalWeight = allocations.reduce((sum, allocation) => sum + allocation.weight, 0);
  if (Math.abs(totalWeight - REQUIRED_WEIGHT_TOTAL) > 0.001) {
    throw new Error(`比率の合計を ${REQUIRED_WEIGHT_TOTAL}% にしてください。現在: ${totalWeight}%`);
  }

  return allocations;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentMonthStart(): string {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function createErrorState(
  previousState: HistoricalPriceChartState,
  message: string,
  overrides?: Partial<HistoricalPriceChartState>,
): HistoricalPriceChartState {
  return {
    ...previousState,
    status: "error",
    message,
    ...overrides,
  };
}

export async function fetchHistoricalSeries(
  previousState: HistoricalPriceChartState,
  formData: FormData,
): Promise<HistoricalPriceChartState> {
  let allocations: PortfolioAllocationInput[] = previousState.allocations;
  try {
    allocations = parseAllocations(formData);
  } catch (error) {
    return createErrorState(
      previousState,
      error instanceof Error ? error.message : "ポートフォリオ入力に誤りがあります。",
      { allocations: previousState.allocations },
    );
  }

  const from = normalizeDate(formData.get("from"), previousState.from);
  const to = normalizeDate(formData.get("to"), previousState.to);

  if (from > to) {
    return createErrorState(previousState, "開始日は終了日以前の日付を指定してください。", {
      allocations,
      from,
      to,
    });
  }

  try {
    const apiTo = currentMonthStart();
    const series = await Promise.all(
      allocations.map(async (allocation) => {
        const response = await getHistoricalPrices(allocation.symbol, { to: apiTo });
        return {
          symbol: response.symbol || allocation.symbol,
          weight: allocation.weight,
          points: normalizePoints(response.historical),
        } satisfies PortfolioSeriesInput;
      }),
    );

    if (series.some((item) => item.points.length === 0)) {
      return createErrorState(previousState, "一部のシンボルで過去データを取得できませんでした。", {
        allocations,
        from,
        to,
        points: [],
      });
    }

    const portfolioSeries = buildPortfolioSeries(series, from, to);
    if (!portfolioSeries) {
      return {
        status: "error",
        message:
          "指定した条件でポートフォリオを算出できませんでした。シンボルの組み合わせか表示期間を見直してください。",
        from,
        to,
        allocations,
        points: [],
      };
    }

    const adjustedFrom = portfolioSeries.effectiveFrom !== from;
    const adjustedTo = portfolioSeries.effectiveTo !== to;
    const adjustmentSuffix =
      adjustedFrom || adjustedTo
        ? ` 表示範囲を ${portfolioSeries.effectiveFrom} - ${portfolioSeries.effectiveTo} に調整しました。`
        : "";

    return {
      status: "success",
      message: `ポートフォリオ時系列を算出しました。${adjustmentSuffix}`.trim(),
      from: portfolioSeries.effectiveFrom,
      to: portfolioSeries.effectiveTo,
      allocations: series.map((item) => ({
        symbol: item.symbol,
        weight: item.weight,
      })),
      points: portfolioSeries.points,
    };
  } catch (error) {
    if (error instanceof FmpApiError) {
      return createErrorState(previousState, `データ取得に失敗しました (HTTP ${error.status})。`, {
        allocations,
        from,
        to,
      });
    }

    if (error instanceof Error && error.message.includes("FMP_API_KEY")) {
      return createErrorState(previousState, "FMP_API_KEY が未設定です。", {
        allocations,
        from,
        to,
      });
    }

    return createErrorState(
      previousState,
      error instanceof Error ? error.message : "不明なエラーが発生しました。",
      {
        allocations,
        from,
        to,
      },
    );
  }
}

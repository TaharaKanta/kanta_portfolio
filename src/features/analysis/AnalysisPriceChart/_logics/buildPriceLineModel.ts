import type { HistoricalPricePoint } from "../_actions";

/**
 * 価格ラインモデル生成時の描画オプション。
 */
interface BuildPriceLineModelOptions {
  width?: number;
  height?: number;
  padding?: number;
}

/**
 * チャート上に描画される 1 点の座標情報。
 */
export interface PriceLinePoint {
  date: string;
  close: number;
  x: number;
  y: number;
}

/**
 * SVG ラインチャート描画に必要な派生データ。
 */
export interface PriceLineModel {
  width: number;
  height: number;
  padding: number;
  path: string;
  areaPath: string;
  points: PriceLinePoint[];
  min: number;
  max: number;
  firstDate: string;
  lastDate: string;
  firstClose: number;
  lastClose: number;
  changePercent: number;
}

function toSorted(points: HistoricalPricePoint[]): HistoricalPricePoint[] {
  return [...points].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildPriceLineModel(
  points: HistoricalPricePoint[],
  options: BuildPriceLineModelOptions = {},
): PriceLineModel | null {
  if (points.length < 2) {
    return null;
  }

  const width = options.width ?? 800;
  const height = options.height ?? 340;
  const padding = options.padding ?? 24;
  const sorted = toSorted(points);
  const values = sorted.map((point) => point.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const safeRange = Math.max(max - min, 1e-8);
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const plottedPoints = sorted.map((point, index) => {
    const x = padding + (index / (sorted.length - 1)) * plotWidth;
    const y = padding + ((max - point.close) / safeRange) * plotHeight;
    return {
      date: point.date,
      close: point.close,
      x,
      y,
    };
  });

  const path = plottedPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const first = plottedPoints[0];
  const last = plottedPoints[plottedPoints.length - 1];
  const areaPath = `${path} L ${last.x.toFixed(2)} ${(height - padding).toFixed(2)} L ${first.x.toFixed(
    2,
  )} ${(height - padding).toFixed(2)} Z`;

  const firstClose = sorted[0].close;
  const lastClose = sorted[sorted.length - 1].close;
  const changePercent = firstClose === 0 ? 0 : ((lastClose - firstClose) / firstClose) * 100;

  return {
    width,
    height,
    padding,
    path,
    areaPath,
    points: plottedPoints,
    min,
    max,
    firstDate: sorted[0].date,
    lastDate: sorted[sorted.length - 1].date,
    firstClose,
    lastClose,
    changePercent,
  };
}

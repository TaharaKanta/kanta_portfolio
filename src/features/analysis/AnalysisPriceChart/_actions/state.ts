/**
 * チャート描画用の日次データ点。
 */
export interface HistoricalPricePoint {
  date: string;
  close: number;
}

/**
 * ポートフォリオ構成の 1 行入力。
 */
export interface PortfolioAllocationInput {
  symbol: string;
  weight: number;
}

/**
 * 分析ページのフォーム/結果状態。
 */
export interface HistoricalPriceChartState {
  status: "idle" | "success" | "error";
  message: string;
  from: string;
  to: string;
  allocations: PortfolioAllocationInput[];
  points: HistoricalPricePoint[];
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 120);

  return {
    from: toIsoDate(from),
    to: toIsoDate(to),
  };
}

const defaultRange = defaultDateRange();

export const initialHistoricalPriceChartState: HistoricalPriceChartState = {
  status: "idle",
  message: "シンボルと比率を設定して、ポートフォリオの推移を表示してください。",
  from: defaultRange.from,
  to: defaultRange.to,
  allocations: [
    { symbol: "AAPL", weight: 40 },
    { symbol: "MSFT", weight: 35 },
    { symbol: "NVDA", weight: 25 },
  ],
  points: [],
};

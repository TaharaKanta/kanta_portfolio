import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { HistoricalPriceChartState } from "./_actions";
import { buildPriceLineModel, type PriceLineModel, type PriceLinePoint } from "./_logics";
import styles from "./styles.module.css";

/**
 * プレゼンテーションコンポーネントの入力。
 */
interface PresentationProps {
  state: HistoricalPriceChartState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}

/**
 * SVG 内ツールチップ描画のレイアウト情報。
 */
interface ChartTooltipLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  dateLabel: string;
  valueLabel: string;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatPortfolioValue(value: number): string {
  return value.toFixed(2);
}

function stateClassName(status: HistoricalPriceChartState["status"]): string {
  if (status === "success") {
    return styles.statusSuccess;
  }
  if (status === "error") {
    return styles.statusError;
  }
  return styles.statusIdle;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSvgX(event: MouseEvent<SVGSVGElement>, chartModel: PriceLineModel): number {
  const svg = event.currentTarget;
  const ctm = svg.getScreenCTM();
  if (ctm) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(ctm.inverse()).x;
  }

  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0) {
    return chartModel.padding;
  }
  return ((event.clientX - rect.left) / rect.width) * chartModel.width;
}

function getHoveredPointIndex(
  event: MouseEvent<SVGSVGElement>,
  chartModel: PriceLineModel,
): number {
  const plotWidth = chartModel.width - chartModel.padding * 2;
  if (plotWidth <= 0) {
    return 0;
  }

  const x = getSvgX(event, chartModel);
  const ratio = (x - chartModel.padding) / plotWidth;
  const nearest = Math.round(ratio * (chartModel.points.length - 1));
  return clamp(nearest, 0, chartModel.points.length - 1);
}

function buildTooltipLayout(point: PriceLinePoint, chartModel: PriceLineModel): ChartTooltipLayout {
  const dateLabel = point.date;
  const valueLabel = `value: ${formatPortfolioValue(point.close)}`;
  const width = Math.max(124, Math.max(dateLabel.length, valueLabel.length) * 7.2 + 18);
  const height = 48;
  const offset = 12;

  let x = point.x + offset;
  if (x + width > chartModel.width - chartModel.padding) {
    x = point.x - width - offset;
  }
  x = clamp(x, chartModel.padding, chartModel.width - chartModel.padding - width);

  let y = point.y - height - offset;
  if (y < chartModel.padding) {
    y = point.y + offset;
  }
  y = clamp(y, chartModel.padding, chartModel.height - chartModel.padding - height);

  return {
    x,
    y,
    width,
    height,
    dateLabel,
    valueLabel,
  };
}

export function Presentation({ state, formAction, isPending }: PresentationProps) {
  const chartModel = buildPriceLineModel(state.points);
  const changeClassName = chartModel && chartModel.changePercent >= 0 ? styles.rise : styles.fall;
  const displayedAllocations = state.allocations.filter((allocation) => allocation.symbol);
  const [symbolValues, setSymbolValues] = useState<[string, string, string]>(() => [
    state.allocations[0]?.symbol ?? "",
    state.allocations[1]?.symbol ?? "",
    state.allocations[2]?.symbol ?? "",
  ]);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);

  const hoveredPoint = useMemo(() => {
    if (!chartModel || hoveredPointIndex === null || !isHoveringChart) {
      return null;
    }
    return chartModel.points[hoveredPointIndex] ?? null;
  }, [chartModel, hoveredPointIndex, isHoveringChart]);

  const tooltipLayout = useMemo(() => {
    if (!chartModel || !hoveredPoint) {
      return null;
    }
    return buildTooltipLayout(hoveredPoint, chartModel);
  }, [chartModel, hoveredPoint]);

  const handleChartMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    if (!chartModel) {
      return;
    }
    setIsHoveringChart(true);
    setHoveredPointIndex(getHoveredPointIndex(event, chartModel));
  };

  const handleChartMouseLeave = () => {
    setIsHoveringChart(false);
    setHoveredPointIndex(null);
  };

  const handleSymbolInputChange = (index: number, value: string) => {
    const normalized = value.toUpperCase();
    setSymbolValues((previous) => {
      const next = [...previous] as [string, string, string];
      next[index] = normalized;
      return next;
    });
  };

  return (
    <section className={styles.section}>
      <h2>ポートフォリオ分析チャート</h2>
      <p className={styles.description}>
        最大 3 シンボルと保有比率を設定し、資金推移（初期値 100）を表示します。API
        は月初時点までの履歴を取得し、From/To は表示範囲の絞り込みに使います。
      </p>

      <form action={formAction} className={styles.form}>
        <div className={styles.allocationRows}>
          {[0, 1, 2].map((index) => {
            const allocation = state.allocations[index] ?? { symbol: "", weight: 0 };
            const row = index + 1;
            return (
              <div className={styles.allocationRow} key={row}>
                <label className={styles.field}>
                  <span>Symbol {row}</span>
                  <input
                    type="text"
                    name={`symbol${row}`}
                    value={symbolValues[index]}
                    placeholder="AAPL"
                    onChange={(event) => handleSymbolInputChange(index, event.currentTarget.value)}
                    autoComplete="off"
                  />
                </label>

                <label className={styles.field}>
                  <span>Weight %</span>
                  <input
                    type="number"
                    name={`weight${row}`}
                    defaultValue={allocation.weight || ""}
                    min={0}
                    max={100}
                    step="0.01"
                  />
                </label>
              </div>
            );
          })}
        </div>

        <label className={styles.field}>
          <span>From</span>
          <input type="date" name="from" defaultValue={state.from} required />
        </label>

        <label className={styles.field}>
          <span>To</span>
          <input type="date" name="to" defaultValue={state.to} required />
        </label>

        <button type="submit" disabled={isPending} aria-busy={isPending} className={styles.button}>
          {isPending ? "取得中..." : "データを取得"}
        </button>
      </form>

      <p className={`${styles.status} ${stateClassName(state.status)}`}>{state.message}</p>

      {chartModel ? (
        <div className={styles.chartPanel}>
          <div className={styles.metrics}>
            <p>
              <strong>Portfolio</strong> / {chartModel.firstDate} - {chartModel.lastDate}
            </p>
            <p>
              初期値: {chartModel.firstClose.toFixed(2)} / 最終値: {chartModel.lastClose.toFixed(2)}
            </p>
            <p className={changeClassName}>騰落率: {formatPercent(chartModel.changePercent)}</p>
            {displayedAllocations.length > 0 ? (
              <p>
                構成:{" "}
                {displayedAllocations.map((item) => `${item.symbol} ${item.weight}%`).join(" / ")}
              </p>
            ) : null}
          </div>

          <div className={styles.chartWrap}>
            <svg
              className={styles.chart}
              viewBox={`0 0 ${chartModel.width} ${chartModel.height}`}
              role="img"
              aria-label="Portfolio value chart"
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
            >
              <defs>
                <linearGradient id="price-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={chartModel.areaPath} fill="url(#price-area-gradient)" />
              <path d={chartModel.path} fill="none" stroke="#15803d" strokeWidth="3" />
              {hoveredPoint ? (
                <g pointerEvents="none">
                  <line
                    className={styles.crosshair}
                    x1={hoveredPoint.x}
                    x2={hoveredPoint.x}
                    y1={chartModel.padding}
                    y2={chartModel.height - chartModel.padding}
                  />
                  <circle
                    className={styles.hoverPoint}
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="4.5"
                  />
                </g>
              ) : null}
              {tooltipLayout ? (
                <g pointerEvents="none">
                  <rect
                    className={styles.tooltipBox}
                    x={tooltipLayout.x}
                    y={tooltipLayout.y}
                    rx="8"
                    ry="8"
                    width={tooltipLayout.width}
                    height={tooltipLayout.height}
                  />
                  <text
                    className={styles.tooltipDate}
                    x={tooltipLayout.x + 9}
                    y={tooltipLayout.y + 18}
                  >
                    {tooltipLayout.dateLabel}
                  </text>
                  <text
                    className={styles.tooltipValue}
                    x={tooltipLayout.x + 9}
                    y={tooltipLayout.y + 36}
                  >
                    {tooltipLayout.valueLabel}
                  </text>
                </g>
              ) : null}
            </svg>
          </div>

          <div className={styles.legend}>
            <span>min: {chartModel.min.toFixed(2)}</span>
            <span>max: {chartModel.max.toFixed(2)}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

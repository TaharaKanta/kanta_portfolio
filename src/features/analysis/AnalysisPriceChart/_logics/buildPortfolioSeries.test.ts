import { describe, expect, it } from "vitest";
import { buildPortfolioSeries } from "./buildPortfolioSeries";

describe("buildPortfolioSeries", () => {
  it("builds portfolio index series from multiple symbols", () => {
    const result = buildPortfolioSeries(
      [
        {
          symbol: "AAA",
          weight: 60,
          points: [
            { date: "2026-01-01", close: 100 },
            { date: "2026-01-02", close: 110 },
          ],
        },
        {
          symbol: "BBB",
          weight: 40,
          points: [
            { date: "2026-01-01", close: 200 },
            { date: "2026-01-02", close: 220 },
          ],
        },
      ],
      "2026-01-01",
      "2026-01-02",
    );

    expect(result).not.toBeNull();
    expect(result?.points).toHaveLength(2);
    expect(result?.points[0].close).toBe(100);
    expect(result?.points[1].close).toBe(110);
  });

  it("returns null when no common dates exist", () => {
    const result = buildPortfolioSeries(
      [
        {
          symbol: "AAA",
          weight: 50,
          points: [{ date: "2026-01-01", close: 100 }],
        },
        {
          symbol: "BBB",
          weight: 50,
          points: [{ date: "2026-01-02", close: 100 }],
        },
      ],
      "2026-01-01",
      "2026-01-02",
    );

    expect(result).toBeNull();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchHistoricalSeries } from "./fetchHistoricalSeries";
import { initialHistoricalPriceChartState } from "./state";

const getHistoricalPricesMock = vi.fn();

vi.mock("@/server/fmp", () => ({
  FmpApiError: class FmpApiError extends Error {
    status: number;

    constructor(status: number) {
      super(`FMP request failed with status ${status}`);
      this.name = "FmpApiError";
      this.status = status;
    }
  },
  getHistoricalPrices: (...args: unknown[]) => getHistoricalPricesMock(...args),
}));

interface PortfolioFormInput {
  symbol1: string;
  weight1: string;
  symbol2: string;
  weight2: string;
  symbol3: string;
  weight3: string;
  from: string;
  to: string;
}

function createFormData(input: PortfolioFormInput): FormData {
  const formData = new FormData();
  formData.set("symbol1", input.symbol1);
  formData.set("weight1", input.weight1);
  formData.set("symbol2", input.symbol2);
  formData.set("weight2", input.weight2);
  formData.set("symbol3", input.symbol3);
  formData.set("weight3", input.weight3);
  formData.set("from", input.from);
  formData.set("to", input.to);
  return formData;
}

describe("fetchHistoricalSeries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00.000Z"));
    getHistoricalPricesMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("supports up to 3 symbols and calculates portfolio series", async () => {
    getHistoricalPricesMock.mockImplementation(async (symbol: string) => {
      if (symbol === "AAPL") {
        return {
          symbol: "AAPL",
          historical: [
            { date: "2025-01-10", close: 100 },
            { date: "2026-02-01", close: 120 },
          ],
        };
      }

      if (symbol === "MSFT") {
        return {
          symbol: "MSFT",
          historical: [
            { date: "2025-01-10", close: 200 },
            { date: "2026-02-01", close: 220 },
          ],
        };
      }

      return {
        symbol: "NVDA",
        historical: [
          { date: "2025-01-10", close: 300 },
          { date: "2026-02-01", close: 330 },
        ],
      };
    });

    const state = await fetchHistoricalSeries(
      initialHistoricalPriceChartState,
      createFormData({
        symbol1: "AAPL",
        weight1: "40",
        symbol2: "MSFT",
        weight2: "35",
        symbol3: "NVDA",
        weight3: "25",
        from: "2024-01-01",
        to: "2026-12-31",
      }),
    );

    expect(getHistoricalPricesMock).toHaveBeenCalledTimes(3);
    expect(getHistoricalPricesMock).toHaveBeenNthCalledWith(1, "AAPL", { to: "2026-02-01" });
    expect(getHistoricalPricesMock).toHaveBeenNthCalledWith(2, "MSFT", { to: "2026-02-01" });
    expect(getHistoricalPricesMock).toHaveBeenNthCalledWith(3, "NVDA", { to: "2026-02-01" });
    expect(state.status).toBe("success");
    expect(state.from).toBe("2025-01-10");
    expect(state.to).toBe("2026-02-01");
    expect(state.points).toHaveLength(2);
    expect(state.points[0].close).toBe(100);
    expect(state.points[1].close).toBe(114);
  });

  it("returns error when weight total is not 100", async () => {
    getHistoricalPricesMock.mockResolvedValue({
      symbol: "AAPL",
      historical: [
        { date: "2025-01-10", close: 100 },
        { date: "2025-06-01", close: 110 },
        { date: "2026-02-01", close: 120 },
      ],
    });

    const state = await fetchHistoricalSeries(
      initialHistoricalPriceChartState,
      createFormData({
        symbol1: "AAPL",
        weight1: "50",
        symbol2: "MSFT",
        weight2: "20",
        symbol3: "",
        weight3: "",
        from: "2025-01-01",
        to: "2025-12-31",
      }),
    );

    expect(state.status).toBe("error");
    expect(state.message).toContain("比率の合計");
    expect(getHistoricalPricesMock).not.toHaveBeenCalled();
  });
});

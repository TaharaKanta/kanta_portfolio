import { describe, expect, it } from "vitest";
import { buildPriceLineModel } from "./buildPriceLineModel";

describe("buildPriceLineModel", () => {
  it("returns null when points are not enough", () => {
    expect(buildPriceLineModel([{ date: "2025-01-01", close: 100 }])).toBeNull();
  });

  it("builds an SVG model from historical points", () => {
    const model = buildPriceLineModel([
      { date: "2025-01-01", close: 100 },
      { date: "2025-01-02", close: 110 },
      { date: "2025-01-03", close: 90 },
    ]);

    expect(model).not.toBeNull();
    expect(model?.path.startsWith("M")).toBe(true);
    expect(model?.areaPath.endsWith("Z")).toBe(true);
    expect(model?.min).toBe(90);
    expect(model?.max).toBe(110);
  });
});

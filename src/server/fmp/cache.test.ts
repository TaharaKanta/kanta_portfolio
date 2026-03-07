import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readHistoricalPriceCache, writeHistoricalPriceCache } from "./cache";

describe("fmp historical cache", () => {
  let cacheDir = "";

  beforeEach(async () => {
    cacheDir = await mkdtemp(path.join(tmpdir(), "fmp-cache-"));
    process.env.FMP_HISTORICAL_CACHE_DIR = cacheDir;
  });

  afterEach(async () => {
    delete process.env.FMP_HISTORICAL_CACHE_DIR;
    await rm(cacheDir, { recursive: true, force: true });
  });

  it("reads cached data when current month cache exists", async () => {
    const response = {
      symbol: "AAPL",
      historical: [
        {
          date: "2026-02-10",
          open: 100,
          high: 105,
          low: 99,
          close: 103,
          volume: 123456,
        },
      ],
    };

    await writeHistoricalPriceCache("AAPL", response, {
      from: "2026-02-01",
      to: "2026-02-10",
    });
    const cached = await readHistoricalPriceCache("AAPL", {
      from: "2026-02-01",
      to: "2026-02-10",
    });

    expect(cached).toEqual(response);
  });

  it("returns null when cache metadata is not current month", async () => {
    const response = {
      symbol: "MSFT",
      historical: [
        {
          date: "2026-02-10",
          open: 200,
          high: 210,
          low: 195,
          close: 205,
          volume: 999,
        },
      ],
    };

    await writeHistoricalPriceCache("MSFT", response, {
      from: "2026-02-01",
      to: "2026-02-10",
    });

    const [fileName] = await readdir(cacheDir);
    const filePath = path.join(cacheDir, fileName);
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as {
      cachedAt: string;
      cacheMonth: string;
      symbol: string;
      options: Record<string, string>;
      response: unknown;
    };
    parsed.cacheMonth = "2000-01-01";
    await writeFile(filePath, JSON.stringify(parsed), "utf8");

    const cached = await readHistoricalPriceCache("MSFT", {
      from: "2026-02-01",
      to: "2026-02-10",
    });
    expect(cached).toBeNull();
  });
});

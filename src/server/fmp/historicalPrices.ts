import { readHistoricalPriceCache, writeHistoricalPriceCache } from "./cache";
import { fmpGet } from "./client";
import type { FmpHistoricalPrice, FmpHistoricalPriceResponse } from "./types";

type HistoricalPriceOptions = {
  from?: string;
  to?: string;
  serietype?: "line";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function writeCacheSafely(
  symbol: string,
  response: FmpHistoricalPriceResponse,
  options?: HistoricalPriceOptions,
): Promise<void> {
  try {
    await writeHistoricalPriceCache(symbol, response, options);
  } catch {
    // キャッシュ書き込み失敗時も API レスポンスは返す。
  }
}

export async function getHistoricalPrices(
  symbol: string,
  options?: HistoricalPriceOptions,
): Promise<FmpHistoricalPriceResponse> {
  const cachedResponse = await readHistoricalPriceCache(symbol, options);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fmpGet<unknown>("/historical-price-eod/full", {
    symbol,
    ...options,
  });

  let normalizedResponse: FmpHistoricalPriceResponse;
  if (Array.isArray(response)) {
    normalizedResponse = {
      symbol,
      historical: response as FmpHistoricalPrice[],
    };
    await writeCacheSafely(symbol, normalizedResponse, options);
    return normalizedResponse;
  }

  if (isRecord(response) && Array.isArray(response.historical)) {
    normalizedResponse = {
      symbol: typeof response.symbol === "string" ? response.symbol : symbol,
      historical: response.historical as FmpHistoricalPrice[],
    };
    await writeCacheSafely(symbol, normalizedResponse, options);
    return normalizedResponse;
  }

  normalizedResponse = {
    symbol,
    historical: [],
  };
  await writeCacheSafely(symbol, normalizedResponse, options);
  return normalizedResponse;
}

export type { HistoricalPriceOptions };

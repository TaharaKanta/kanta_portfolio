import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FmpHistoricalPriceResponse } from "./types";

/**
 * historical-price API のクエリ条件を表す。
 */
export interface HistoricalPriceCacheOptions {
  from?: string;
  to?: string;
  serietype?: "line";
}

/**
 * 履歴データキャッシュの保存フォーマット。
 */
interface HistoricalPriceCacheEntry {
  cachedAt: string;
  cacheMonth: string;
  symbol: string;
  options: HistoricalPriceCacheOptions;
  response: FmpHistoricalPriceResponse;
}

function getBaseCacheDir(): string {
  const overrideDir = process.env.FMP_HISTORICAL_CACHE_DIR?.trim();
  if (overrideDir) {
    return path.resolve(overrideDir);
  }

  return path.join(process.cwd(), "src/server/fmp/data");
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
}

function getCurrentMonthStart(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function toCacheKey(
  symbol: string,
  monthStart: string,
  options?: HistoricalPriceCacheOptions,
): string {
  const normalizedSymbol = sanitizeSegment(symbol || "unknown");
  const normalizedFrom = sanitizeSegment(options?.from || "all");
  const normalizedTo = sanitizeSegment(options?.to || "latest");
  const normalizedSeries = sanitizeSegment(options?.serietype || "default");
  const normalizedMonth = sanitizeSegment(monthStart);
  return `${normalizedSymbol}__${normalizedFrom}__${normalizedTo}__${normalizedSeries}__${normalizedMonth}.json`;
}

function toCachePath(
  symbol: string,
  monthStart: string,
  options?: HistoricalPriceCacheOptions,
): string {
  return path.join(getBaseCacheDir(), toCacheKey(symbol, monthStart, options));
}

function isHistoricalPriceCacheEntry(value: unknown): value is HistoricalPriceCacheEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("cachedAt" in value) || typeof value.cachedAt !== "string") {
    return false;
  }

  if (!("cacheMonth" in value) || typeof value.cacheMonth !== "string") {
    return false;
  }

  if (!("response" in value) || typeof value.response !== "object" || value.response === null) {
    return false;
  }

  return true;
}
export async function readHistoricalPriceCache(
  symbol: string,
  options?: HistoricalPriceCacheOptions,
): Promise<FmpHistoricalPriceResponse | null> {
  const currentMonthStart = getCurrentMonthStart();
  const cachePath = toCachePath(symbol, currentMonthStart, options);

  try {
    const text = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(text) as unknown;

    if (!isHistoricalPriceCacheEntry(parsed)) {
      return null;
    }

    if (parsed.cacheMonth !== currentMonthStart) {
      return null;
    }

    return parsed.response;
  } catch {
    return null;
  }
}

export async function writeHistoricalPriceCache(
  symbol: string,
  response: FmpHistoricalPriceResponse,
  options?: HistoricalPriceCacheOptions,
): Promise<void> {
  const currentMonthStart = getCurrentMonthStart();
  const cacheDir = getBaseCacheDir();
  const cachePath = toCachePath(symbol, currentMonthStart, options);
  const entry: HistoricalPriceCacheEntry = {
    cachedAt: new Date().toISOString(),
    cacheMonth: currentMonthStart,
    symbol,
    options: options || {},
    response,
  };

  await mkdir(cacheDir, { recursive: true });
  await writeFile(cachePath, JSON.stringify(entry), "utf8");
}

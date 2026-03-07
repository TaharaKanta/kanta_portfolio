import { fmpGet } from "./client";
import type { FmpQuote } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getQuote(symbol: string): Promise<FmpQuote[]> {
  const response = await fmpGet<unknown>("/quote", { symbol });
  if (Array.isArray(response)) {
    return response as FmpQuote[];
  }
  if (isRecord(response)) {
    return [response as FmpQuote];
  }
  return [];
}

export async function getBatchQuote(symbols: string[]): Promise<FmpQuote[]> {
  return fmpGet<FmpQuote[]>("/batch-quote", {
    symbols: symbols.join(","),
  });
}

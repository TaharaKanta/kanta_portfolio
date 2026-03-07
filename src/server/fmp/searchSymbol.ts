import { fmpGet } from "./client";
import type { FmpSearchSymbolResult } from "./types";

export async function searchSymbol(query: string): Promise<FmpSearchSymbolResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  return fmpGet<FmpSearchSymbolResult[]>("/search-symbol", {
    query: normalizedQuery,
  });
}

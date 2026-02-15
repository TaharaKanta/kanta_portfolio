import "server-only";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";

type FmpQueryValue = string | number | boolean | null | undefined;
type FmpQueryParams = Record<string, FmpQueryValue>;

export class FmpApiError extends Error {
  status: number;
  url: string;
  responseBody?: string;

  constructor(status: number, url: string, responseBody?: string) {
    super(`FMP request failed with status ${status} for ${url}`);
    this.name = "FmpApiError";
    this.status = status;
    this.url = url;
    this.responseBody = responseBody;
  }
}

function getFmpApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error("FMP_API_KEY is not set in environment variables.");
  }

  return apiKey;
}

function buildFmpUrl(path: string, params: FmpQueryParams = {}): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${FMP_BASE_URL}${normalizedPath}`);

  url.searchParams.set("apikey", getFmpApiKey());

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return url;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fmpGet<T>(
  path: string,
  params: FmpQueryParams = {},
  init?: RequestInit,
): Promise<T> {
  const url = buildFmpUrl(path, params);
  const response = await fetch(url, {
    ...init,
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => undefined);
    throw new FmpApiError(response.status, url.toString(), responseBody);
  }

  return (await response.json()) as T;
}

export type FmpQuote = {
  symbol: string;
  name?: string;
  price: number;
  change?: number;
  changesPercentage?: number;
  dayLow?: number;
  dayHigh?: number;
  yearHigh?: number;
  yearLow?: number;
  marketCap?: number;
  volume?: number;
  avgVolume?: number;
  exchange?: string;
  open?: number;
  previousClose?: number;
  eps?: number;
  pe?: number;
  earningsAnnouncement?: string;
  sharesOutstanding?: number;
  timestamp?: number;
};

export type FmpHistoricalPrice = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
  unadjustedVolume?: number;
  change?: number;
  changePercent?: number;
  vwap?: number;
  label?: string;
  changeOverTime?: number;
};

export type FmpHistoricalPriceResponse = {
  symbol: string;
  historical: FmpHistoricalPrice[];
};

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

export async function getHistoricalPrices(
  symbol: string,
  options?: {
    from?: string;
    to?: string;
    serietype?: "line";
  },
): Promise<FmpHistoricalPriceResponse> {
  const response = await fmpGet<unknown>("/historical-price-eod/full", {
    symbol,
    ...options,
  });

  if (Array.isArray(response)) {
    return {
      symbol,
      historical: response as FmpHistoricalPrice[],
    };
  }

  if (isRecord(response) && Array.isArray(response.historical)) {
    return {
      symbol: typeof response.symbol === "string" ? response.symbol : symbol,
      historical: response.historical as FmpHistoricalPrice[],
    };
  }

  return {
    symbol,
    historical: [],
  };
}

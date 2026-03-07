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

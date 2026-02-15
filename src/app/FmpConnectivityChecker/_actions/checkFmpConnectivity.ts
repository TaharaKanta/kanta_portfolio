"use server";

import type { FmpConnectivityState } from "./state";

const CONNECTIVITY_SYMBOL = "AAPL";

function createErrorState(message: string): FmpConnectivityState {
  return {
    status: "error",
    message,
    checkedAt: new Date().toISOString(),
  };
}

function isFmpApiError(error: unknown): error is Error & { status: number } {
  return (
    error instanceof Error &&
    error.name === "FmpApiError" &&
    "status" in error &&
    typeof error.status === "number"
  );
}

export async function checkFmpConnectivity(
  previousState: FmpConnectivityState,
): Promise<FmpConnectivityState> {
  void previousState;

  try {
    const fmpModule = await import("@/server/fmp");
    const { getQuote } = fmpModule;
    console.log("FMP API への疎通確認を開始します。");
    const quotes = await getQuote(CONNECTIVITY_SYMBOL);
    console.log("FMP API からのレスポンスを受け取りました:", quotes);
    if (!Array.isArray(quotes) || quotes.length === 0) {
      return createErrorState("1:FMP API から想定外のレスポンスが返却されました。");
    }

    const quote = quotes[0];
    if (!Number.isFinite(quote.price)) {
      return createErrorState("価格データが取得できなかったため、疎通結果を確定できませんでした。");
    }

    return {
      status: "success",
      message: "FMP API への接続は成功しました。",
      checkedAt: new Date().toISOString(),
      symbol: quote.symbol ?? CONNECTIVITY_SYMBOL,
      price: quote.price,
    };
  } catch (error) {
    if (isFmpApiError(error)) {
      return createErrorState(`2:FMP API への接続は失敗しました (HTTP ${error.status})。`);
    }

    if (error instanceof Error && error.message.includes("FMP_API_KEY")) {
      return createErrorState("FMP_API_KEY が未設定です。");
    }

    return createErrorState(
      error instanceof Error ? error.message : "疎通確認中に不明なエラーが発生しました。",
    );
  }
}

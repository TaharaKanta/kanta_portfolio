export type FmpConnectivityState = {
  status: "idle" | "success" | "error";
  message: string;
  checkedAt?: string;
  symbol?: string;
  price?: number;
};

export const initialFmpConnectivityState: FmpConnectivityState = {
  status: "idle",
  message: "未確認です。ボタンで API 疎通をチェックしてください。",
};

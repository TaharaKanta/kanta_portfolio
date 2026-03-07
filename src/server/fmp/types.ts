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

export type FmpSearchSymbolResult = {
  symbol: string;
  name?: string;
  currency?: string;
  stockExchange?: string;
  exchangeShortName?: string;
};

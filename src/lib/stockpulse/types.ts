export type Quote = {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  volume: number;
  change: number;
  change_pct: number;
  currency: string;
  name?: string;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Period = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y";

export type Alert = {
  id: string;
  ticker: string;
  direction: "above" | "below";
  price: number;
  triggered: boolean;
  createdAt: number;
};

export type Holding = {
  id: string;
  ticker: string;
  qty: number;
  avgCost: number;
};

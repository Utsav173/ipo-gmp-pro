import { SetStateAction } from "react";

export interface GmpDataItem {
  ipo: string;
  price: string;
  gmp: string;
  est_listing: string;
  ipo_size: string;
  lot: string;
  open: string | null;
  close: string | null;
  boa_dt: string | null;
  listing: string | null;
  gmp_updated: string;
  classname: string | null;
}

export interface StatsData {
  activeIPOs: number;
  upcomingIPOs: number;
  avgGMP: number;
}

export enum SortBy {
  IPO = "ipo",
  PRICE = "price",
  GMP = "gmp",
  EST_LISTING = "est_listing",
  IPO_SIZE = "ipo_size",
  LOT = "lot",
  OPEN = "open",
  CLOSE = "close",
  BOA_DT = "boa_dt",
  LISTING = "listing",
  GMP_UPDATED = "gmp_updated",
}

export interface SearchAndControlsProps {
  searchTerm: string;
  setSearchTerm: (value: SetStateAction<string>) => void;
  sortBy: string;
  setSortBy: (value: SetStateAction<SortBy>) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: SetStateAction<"asc" | "desc">) => void;
  isMobile?: boolean;
  fetchData: VoidFunction;
  refreshing: boolean;
}

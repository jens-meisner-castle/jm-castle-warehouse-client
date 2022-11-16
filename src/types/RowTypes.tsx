import { CountUnit } from "jm-castle-warehouse-types/build";

export interface StoreRow {
  storeId: string;
  name: string;
}

export interface StoreSectionRow {
  sectionId: string;
  storeId: string;
  name: string;
}

export interface ArticleRow {
  articleId: string;
  name: string;
  countUnit: CountUnit;
}

export type EmployeeId = string;

export interface ReceiptRow {
  sectionId: string;
  articleId: string;
  count: number;
  by: EmployeeId;
  at: Date;
}

export interface EmissionRow {
  sectionId: string;
  articleId: string;
  count: number;
  by: EmployeeId;
  at: Date;
}

export type StockChangingRow = (ReceiptRow | EmissionRow) & {
  type: "in" | "out";
};

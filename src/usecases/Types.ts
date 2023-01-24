import { ArticleStockState } from "jm-castle-warehouse-types/build";
import { Dispatch, SetStateAction } from "react";
import { SizeVariant } from "../components/SizeVariant";
import { ArticleRow } from "../types/RowTypes";

export interface InventoryState {
  id: "inventory";
  data: {
    article?: ArticleRow;
    newArticle?: ArticleRow;
    stock?: ArticleStockState;
    temp: { article?: Partial<ArticleRow> };
  };
}
export interface EmptyState {
  id: "empty";
  data: undefined;
}

export type UsecaseState = InventoryState | EmptyState;

export interface GeneralUsecaseProps {
  sizeVariant: SizeVariant;
  setUsecaseState: Dispatch<SetStateAction<UsecaseState>>;
}

import { SizeVariant } from "../components/SizeVariant";
import {
  ArticleRow,
  EmissionRow,
  ReceiptRow,
  StoreSectionRow,
} from "../types/RowTypes";

export interface SectionDifference {
  sectionId: string;
  currentValue: number;
  newValue: number | null;
  costUnit: string | null;
}
export interface InventoryData {
  article?: ArticleRow;
  newArticle?: ArticleRow;
  temporaryArticle?: Partial<ArticleRow>;
  sectionDifferences?: SectionDifference[];
  emissions?: EmissionRow[];
  receipts?: ReceiptRow[];
}

export interface RelocateData {
  article?: ArticleRow;
  from?: StoreSectionRow;
  to?: StoreSectionRow;
  emission?: EmissionRow;
  receipt?: ReceiptRow;
  originalReceipt?: ReceiptRow;
}
export interface InventoryState {
  id: "inventory";
  data: InventoryData;
}
export interface RelocateState {
  id: "relocate";
  data: RelocateData;
}
export interface EmptyState {
  id: "empty";
  data?: never;
}

export const isInventoryState = (state: {
  id: string;
}): state is InventoryState => state.id === "inventory";

export const isRelocateState = (state: {
  id: string;
}): state is RelocateState => state.id === "relocate";

export type UsecaseData = InventoryData | RelocateData;

export type UsecaseState = InventoryState | RelocateState | EmptyState;

export interface GeneralUsecaseProps {
  sizeVariant: SizeVariant;
  updateUsecaseData: (
    updates: { data: Partial<UsecaseData> } & { id: UsecaseState["id"] }
  ) => void;
  cancelUsecase: () => void;
}

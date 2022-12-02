import {
  CountUnit,
  Row_Article,
  Row_Emission,
  Row_Masterdata,
  Row_Receipt,
  Row_Store,
  Row_StoreSection,
} from "jm-castle-warehouse-types/build";

export interface MasterdataRow {
  datasetVersion: number;
  createdAt: Date;
  editedAt: Date;
}
export interface StoreRow extends MasterdataRow {
  storeId: string;
  name: string;
}

export interface StoreSectionRow extends MasterdataRow {
  sectionId: string;
  storeId: string;
  name: string;
}

export interface ArticleRow extends MasterdataRow {
  articleId: string;
  name: string;
  countUnit: CountUnit;
  articleImgRef: string | undefined;
}

export const toRawMasterdataFields = (row: MasterdataRow): Row_Masterdata => {
  return {
    dataset_version: row.datasetVersion,
    created_at: Math.floor(row.createdAt.getTime() / 1000),
    edited_at: Math.floor(row.editedAt.getTime() / 1000),
  };
};

export const fromRawMasterdataFields = (raw: Row_Masterdata): MasterdataRow => {
  return {
    datasetVersion: raw.dataset_version,
    createdAt: new Date(raw.created_at * 1000),
    editedAt: new Date(raw.edited_at * 1000),
  };
};

export const toRawArticle = (row: ArticleRow): Row_Article => {
  return {
    article_id: row.articleId,
    name: row.name,
    article_img_ref: row.articleImgRef || null,
    count_unit: row.countUnit,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawArticle = (raw: Row_Article): ArticleRow => {
  return {
    articleId: raw.article_id,
    name: raw.name,
    articleImgRef: raw.article_img_ref || undefined,
    countUnit: raw.count_unit,
    ...fromRawMasterdataFields(raw),
  };
};

export const toRawStore = (row: StoreRow): Row_Store => {
  return {
    store_id: row.storeId,
    name: row.name,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawStore = (raw: Row_Store): StoreRow => {
  return {
    storeId: raw.store_id,
    name: raw.name,
    ...fromRawMasterdataFields(raw),
  };
};

export const toRawStoreSection = (row: StoreSectionRow): Row_StoreSection => {
  return {
    section_id: row.sectionId,
    store_id: row.storeId,
    name: row.name,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawStoreSection = (raw: Row_StoreSection): StoreSectionRow => {
  return {
    sectionId: raw.section_id,
    storeId: raw.store_id,
    name: raw.name,
    ...fromRawMasterdataFields(raw),
  };
};

export type EmployeeId = string;

export interface ReceiptRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  count: number;
  by: EmployeeId;
  at: Date;
}

export interface EmissionRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  count: number;
  by: EmployeeId;
  at: Date;
}

export type StockChangingRow = (ReceiptRow | EmissionRow) & {
  type: "in" | "out";
};

export const stockChangingRowFromRaw = (
  row: Row_Receipt | Row_Emission,
  type: "in" | "out"
) => {
  const newRow: StockChangingRow = {
    type,
    datasetId: row.dataset_id,
    articleId: row.article_id,
    at: new Date(row.at_seconds * 1000),
    sectionId: row.section_id,
    by: row.by_user,
    count: row.article_count,
  };
  return newRow;
};

export type ImageContent = ReadableStream;

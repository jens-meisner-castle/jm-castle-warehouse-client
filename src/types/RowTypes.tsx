import {
  CountUnit,
  Row_Article,
  Row_Emission,
  Row_Hashtag,
  Row_ImageContent,
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
  imageRefs: string[] | undefined;
}

export interface StoreSectionRow extends MasterdataRow {
  sectionId: string;
  storeId: string;
  name: string;
  imageRefs: string[] | undefined;
}

export interface ArticleRow extends MasterdataRow {
  articleId: string;
  name: string;
  countUnit: CountUnit;
  imageRefs: string[] | undefined;
  hashtags: string[] | undefined;
  wwwLink: string | undefined;
}

export interface HashtagRow extends MasterdataRow {
  tagId: string;
  name: string;
}

export interface ImageContentRow extends MasterdataRow {
  imageId: string;
  imageExtension: string;
  sizeInBytes: number;
  width: number;
  height: number;
}

export type EmployeeId = string;

export interface ReceiptRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  articleCount: number;
  byUser: EmployeeId;
  receiptAt: Date;
  wwwLink: string | undefined;
  guarantyTo: Date | undefined;
  imageRefs: string[] | undefined;
}

export interface EmissionRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  articleCount: number;
  byUser: EmployeeId;
  emittedAt: Date;
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
    image_refs: row.imageRefs ? JSON.stringify(row.imageRefs) : null,
    hashtags: row.hashtags ? JSON.stringify(row.hashtags) : null,
    count_unit: row.countUnit,
    www_link: row.wwwLink || null,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawArticle = (raw: Row_Article): ArticleRow => {
  return {
    articleId: raw.article_id,
    name: raw.name,
    imageRefs: raw.image_refs ? JSON.parse(raw.image_refs) : undefined,
    hashtags: raw.hashtags ? JSON.parse(raw.hashtags) : undefined,
    countUnit: raw.count_unit,
    wwwLink: raw.www_link || undefined,
    ...fromRawMasterdataFields(raw),
  };
};

export const toRawHashtag = (row: HashtagRow): Row_Hashtag => {
  return {
    tag_id: row.tagId,
    name: row.name,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawHashtag = (raw: Row_Hashtag): HashtagRow => {
  return {
    tagId: raw.tag_id,
    name: raw.name,
    ...fromRawMasterdataFields(raw),
  };
};

export const toRawStore = (row: StoreRow): Row_Store => {
  return {
    store_id: row.storeId,
    name: row.name,
    image_refs: row.imageRefs ? JSON.stringify(row.imageRefs) : null,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawStore = (raw: Row_Store): StoreRow => {
  return {
    storeId: raw.store_id,
    name: raw.name,
    imageRefs: raw.image_refs ? JSON.parse(raw.image_refs) : undefined,
    ...fromRawMasterdataFields(raw),
  };
};

export const toRawStoreSection = (row: StoreSectionRow): Row_StoreSection => {
  return {
    section_id: row.sectionId,
    store_id: row.storeId,
    name: row.name,
    image_refs: row.imageRefs ? JSON.stringify(row.imageRefs) : null,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawStoreSection = (raw: Row_StoreSection): StoreSectionRow => {
  return {
    sectionId: raw.section_id,
    storeId: raw.store_id,
    name: raw.name,
    imageRefs: raw.image_refs ? JSON.parse(raw.image_refs) : undefined,
    ...fromRawMasterdataFields(raw),
  };
};

export const toRawImageContent = (row: ImageContentRow): Row_ImageContent => {
  return {
    image_id: row.imageId,
    image_extension: row.imageExtension,
    size_in_bytes: row.sizeInBytes,
    width: row.width,
    height: row.height,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawImageContent = (raw: Row_ImageContent): ImageContentRow => {
  return {
    imageId: raw.image_id,
    imageExtension: raw.image_extension,
    sizeInBytes: raw.size_in_bytes,
    width: raw.width,
    height: raw.height,
    ...fromRawMasterdataFields(raw),
  };
};

export const fromRawEmission = (raw: Row_Emission): EmissionRow => {
  return {
    datasetId: raw.dataset_id,
    sectionId: raw.section_id,
    articleId: raw.article_id,
    articleCount: raw.article_count,
    byUser: raw.by_user,
    emittedAt: new Date(raw.emitted_at * 1000),
  };
};

export const toRawEmission = (row: EmissionRow): Row_Emission => {
  return {
    dataset_id: row.datasetId,
    section_id: row.sectionId,
    article_id: row.articleId,
    article_count: row.articleCount,
    by_user: row.byUser,
    emitted_at: Math.floor(row.emittedAt.getTime() / 1000),
  };
};

export const fromRawReceipt = (raw: Row_Receipt): ReceiptRow => {
  return {
    datasetId: raw.dataset_id,
    sectionId: raw.section_id,
    articleId: raw.article_id,
    articleCount: raw.article_count,
    byUser: raw.by_user,
    receiptAt: new Date(raw.receipt_at * 1000),
    imageRefs: raw.image_refs ? JSON.parse(raw.image_refs) : undefined,
    wwwLink: raw.www_link || undefined,
    guarantyTo: raw.guaranty_to ? new Date(raw.guaranty_to * 1000) : undefined,
  };
};

export const toRawReceipt = (row: ReceiptRow): Row_Receipt => {
  return {
    dataset_id: row.datasetId,
    section_id: row.sectionId,
    article_id: row.articleId,
    article_count: row.articleCount,
    by_user: row.byUser,
    receipt_at: Math.floor(row.receiptAt.getTime() / 1000),
    image_refs: row.imageRefs ? JSON.stringify(row.imageRefs) : null,
    www_link: row.wwwLink || null,
    guaranty_to: row.guarantyTo
      ? Math.floor(row.guarantyTo.getTime() / 1000)
      : null,
  };
};

export type StockChangingRow = {
  type: "in" | "out";
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  count: number;
  by: EmployeeId;
  at: Date;
};

export const stockChangingRowFromRawEmission = (raw: Row_Emission) => {
  const newRow: StockChangingRow = {
    type: "out",
    datasetId: raw.dataset_id,
    articleId: raw.article_id,
    at: new Date(raw.emitted_at * 1000),
    sectionId: raw.section_id,
    by: raw.by_user,
    count: raw.article_count,
  };
  return newRow;
};

export const stockChangingRowFromRawReceipt = (raw: Row_Receipt) => {
  const newRow: StockChangingRow = {
    type: "in",
    datasetId: raw.dataset_id,
    articleId: raw.article_id,
    at: new Date(raw.receipt_at * 1000),
    sectionId: raw.section_id,
    by: raw.by_user,
    count: raw.article_count,
  };
  return newRow;
};

export type ImageContent = ReadableStream;

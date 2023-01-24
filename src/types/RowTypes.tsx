import {
  ArticleStockState,
  CountUnit,
  EmissionReason,
  EmissionRequestReason,
  ReceiptReason,
  ReceiptRequestReason,
  Row_Article,
  Row_Emission,
  Row_Hashtag,
  Row_ImageContent,
  Row_Masterdata,
  Row_Receipt,
  Row_Receiver,
  Row_Store,
  Row_StoreSection,
  StockStateCounts,
} from "jm-castle-warehouse-types/build";
import {
  compareDate,
  CompareFunction,
  compareNumber,
  compareString,
} from "../utils/Compare";
import { OrderDirection } from "./Types";

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

export interface ReceiverRow extends MasterdataRow {
  receiverId: string;
  name: string;
  mailAddress: string;
}

export interface ImageContentRow extends MasterdataRow {
  imageId: string;
  imageExtension: string;
  sizeInBytes: number;
  width: number;
  height: number;
}

export type EmployeeId = string;

export interface ReceiptRequestRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  articleCount: number;
  byUser: EmployeeId;
  requestedAt: Date;
  wwwLink: string | undefined;
  guarantyTo: Date | undefined;
  imageRefs: string[] | undefined;
  reason: ReceiptRequestReason;
  receiver: string;
}
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
  reason: ReceiptReason;
}

export interface EmissionRequestRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  articleCount: number;
  byUser: EmployeeId;
  requestedAt: Date;
  reason: EmissionRequestReason;
  receiver: string;
}

export interface EmissionRow {
  datasetId: number | "new";
  sectionId: string;
  articleId: string;
  articleCount: number;
  byUser: EmployeeId;
  emittedAt: Date;
  reason: EmissionReason;
  receiver: string;
}

export type StockArticleRow = ArticleRow & {
  sectionStates: Array<{ section: StoreSectionRow } & StockStateCounts>;
};

export type StockArticleRowExt = StockArticleRow & {
  physicalCount: number;
  availableCount: number;
  sectionsWithCount: StoreSectionRow[];
};

export const isSavingArticleAllowed = (row: Partial<ArticleRow>) =>
  !!row.articleId && !!row.name && !!row.countUnit;

export const isArticleRow = (row: Partial<ArticleRow>): row is ArticleRow =>
  isSavingArticleAllowed(row);

export const stockArticleExtRowsFromStockState = (
  stock: Record<string, ArticleStockState>
) => {
  const newRows: StockArticleRowExt[] = [];
  Object.keys(stock).forEach((articleId) => {
    const article = fromRawArticle(stock[articleId].article);
    const sectionStates: StockArticleRow["sectionStates"] = [];
    let physicalCount = 0;
    let availableCount = 0;
    const sectionsWithCount: StoreSectionRow[] = [];
    stock[articleId].states.forEach((state) => {
      physicalCount = physicalCount + state.physicalCount;
      availableCount = availableCount + state.availableCount;
      const sectionState = {
        section: fromRawStoreSection(state.section),
        physicalCount: state.physicalCount,
        availableCount: state.availableCount,
      };
      sectionStates.push(sectionState);
      (state.physicalCount > 0 || state.availableCount > 0) &&
        sectionsWithCount.push(sectionState.section);
    });
    newRows.push({
      ...article,
      sectionStates,
      sectionsWithCount,
      physicalCount,
      availableCount,
    });
  });
  return newRows;
};

export const compareStockArticleRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<StockArticleRowExt>
> = {
  articleId: (direction: OrderDirection) =>
    compareString<StockArticleRow>("articleId", direction),
  name: (direction: OrderDirection) =>
    compareString<StockArticleRow>("name", direction),
  physicalCount: (direction: OrderDirection) =>
    compareNumber<StockArticleRowExt>("physicalCount", direction),
  availableCount: (direction: OrderDirection) =>
    compareNumber<StockArticleRowExt>("availableCount", direction),
};

export const compareArticleRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<ArticleRow>
> = {
  articleId: (direction: OrderDirection) =>
    compareString<ArticleRow>("articleId", direction),
  name: (direction: OrderDirection) =>
    compareString<ArticleRow>("name", direction),
};

export const compareImageRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<ImageContentRow>
> = {
  imageId: (direction: OrderDirection) =>
    compareString<ImageContentRow>("imageId", direction),
};

export const compareReceiverRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<ReceiverRow>
> = {
  receiverId: (direction: OrderDirection) =>
    compareString<ReceiverRow>("receiverId", direction),
  name: (direction: OrderDirection) =>
    compareString<ReceiverRow>("name", direction),
};

export const compareStoreRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<StoreRow>
> = {
  storeId: (direction: OrderDirection) =>
    compareString<StoreRow>("storeId", direction),
  name: (direction: OrderDirection) =>
    compareString<StoreRow>("name", direction),
};

export const compareStoreSectionRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<StoreSectionRow>
> = {
  sectionId: (direction: OrderDirection) =>
    compareString<StoreSectionRow>("sectionId", direction),
  storeId: (direction: OrderDirection) =>
    compareString<StoreSectionRow>("storeId", direction),
  name: (direction: OrderDirection) =>
    compareString<StoreSectionRow>("name", direction),
};

export const compareHashtagRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<HashtagRow>
> = {
  tagId: (direction: OrderDirection) =>
    compareString<HashtagRow>("tagId", direction),
  name: (direction: OrderDirection) =>
    compareString<HashtagRow>("name", direction),
};

export const compareEmissionRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<EmissionRow>
> = {
  articleId: (direction: OrderDirection) =>
    compareString<EmissionRow>("articleId", direction),
  sectionId: (direction: OrderDirection) =>
    compareString<EmissionRow>("sectionId", direction),
  articleCount: (direction: OrderDirection) =>
    compareNumber<EmissionRow>("articleCount", direction),
  emittedAt: (direction: OrderDirection) =>
    compareDate<EmissionRow>("emittedAt", direction),
};

export const compareReceiptRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<ReceiptRow>
> = {
  articleId: (direction: OrderDirection) =>
    compareString<ReceiptRow>("articleId", direction),
  sectionId: (direction: OrderDirection) =>
    compareString<ReceiptRow>("sectionId", direction),
  articleCount: (direction: OrderDirection) =>
    compareNumber<ReceiptRow>("articleCount", direction),
  receiptAt: (direction: OrderDirection) =>
    compareDate<ReceiptRow>("receiptAt", direction),
};

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

export const toRawReceiver = (row: ReceiverRow): Row_Receiver => {
  return {
    receiver_id: row.receiverId,
    name: row.name,
    mail_address: row.mailAddress,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawReceiver = (raw: Row_Receiver): ReceiverRow => {
  return {
    receiverId: raw.receiver_id,
    name: raw.name,
    mailAddress: raw.mail_address,
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
    reason: raw.reason,
    receiver: raw.receiver,
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
    reason: row.reason,
    receiver: row.receiver,
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
    reason: raw.reason,
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
    reason: row.reason,
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

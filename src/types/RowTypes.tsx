import { ValueType, ValueUnit } from "jm-castle-types/build";
import {
  ArticleStockState,
  AttributeValue,
  CountUnit,
  EmissionReason,
  EmissionRequestReason,
  ReceiptReason,
  ReceiptRequestReason,
  Row_Article,
  Row_Attribute,
  Row_Costunit,
  Row_Emission,
  Row_Hashtag,
  Row_ImageContent,
  Row_Manufacturer,
  Row_Masterdata,
  Row_Receipt,
  Row_Receiver,
  Row_Store,
  Row_StoreSection,
  StockStateCounts,
} from "jm-castle-warehouse-types/build";
import { ErrorData } from "../components/ErrorDisplays";
import { badCharsInSearchValue } from "../configuration/Urls";
import {
  compareDate,
  CompareFunction,
  compareNumber,
  compareString,
  includesOneOf,
} from "../utils/Compare";
import { OrderDirection } from "./Types";

export interface MasterdataRow {
  datasetVersion: number;
  createdAt: Date;
  editedAt: Date;
}

export const initialMasterdataRow = (): MasterdataRow => ({
  createdAt: new Date(),
  editedAt: new Date(),
  datasetVersion: 1,
});

export interface StoreRow extends MasterdataRow {
  storeId: string;
  name: string;
  imageRefs: string[] | undefined;
}

export interface StoreSectionRow extends MasterdataRow {
  sectionId: string;
  storeId: string;
  name: string;
  shortId: string;
  imageRefs: string[] | undefined;
}

export type AttributeValues = Record<string, AttributeValue>;

export interface ArticleRow extends MasterdataRow {
  articleId: string;
  name: string;
  countUnit: CountUnit;
  imageRefs: string[] | undefined;
  hashtags: string[] | undefined;
  wwwLink: string | undefined;
  manufacturer: string;
  attributes: AttributeValues | undefined;
}

export interface AttributeRow extends MasterdataRow {
  attributeId: string;
  name: string;
  valueType: ValueType;
  valueUnit: ValueUnit | undefined;
}

export interface HashtagRow extends MasterdataRow {
  tagId: string;
  name: string;
}
export interface CostunitRow extends MasterdataRow {
  unitId: string;
  name: string;
}

export interface ReceiverRow extends MasterdataRow {
  receiverId: string;
  name: string;
  mailAddress: string;
}

export interface ManufacturerRow extends MasterdataRow {
  manufacturerId: string;
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
  costUnit: string;
  price: number | undefined;
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
  imageRefs: string[] | undefined;
  costUnit: string;
  price: number | undefined;
}

export type StockArticleRow = ArticleRow & {
  sectionStates: Array<{ section: StoreSectionRow } & StockStateCounts>;
};

export type StockArticleRowExt = StockArticleRow & {
  physicalCount: number;
  availableCount: number;
  sectionsWithCount: StoreSectionRow[];
};

const ckeckPositiveNumber = (n: number | undefined) => {
  return typeof n === "number" && n > 0
    ? undefined
    : { error: "Dieser Wert muss größer 0 sein." };
};

const checkMandatoryString = (s: string | undefined): ErrorData | undefined => {
  if (!s) {
    return { error: "Dieser Wert darf nicht undefiniert sein." };
  }
  const stripped = s.trim();
  const startsOrEndsWithWhitespace = s.length !== stripped.length;

  const includesBadChar = includesOneOf(stripped, badCharsInSearchValue);

  return !startsOrEndsWithWhitespace && !includesBadChar
    ? undefined
    : {
        error: includesBadChar
          ? `Dieser Wert enthält unerlaubte Zeichen. Nicht erlaubt sind: ${badCharsInSearchValue.join(
              ", "
            )}`
          : "Dieser Wert darf nicht mit Leerzeichen beginnen oder enden.",
      };
};

export const isSavingArticleAllowed = (row: Partial<ArticleRow>) => {
  const errorData: Partial<Record<keyof ArticleRow, ErrorData | undefined>> = {
    articleId: checkMandatoryString(row.articleId),
    name: checkMandatoryString(row.name),
    manufacturer: checkMandatoryString(row.manufacturer),
  };
  return {
    isSavingAllowed:
      !errorData.articleId &&
      !errorData.name &&
      !errorData.manufacturer &&
      !!row.countUnit,
    errorData,
  };
};

export const isArticleRow = (row: Partial<ArticleRow>): row is ArticleRow => {
  const { isSavingAllowed } = isSavingArticleAllowed(row);
  return isSavingAllowed;
};

export const isSavingAttributeAllowed = (row: Partial<AttributeRow>) => {
  const errorData: Partial<Record<keyof AttributeRow, ErrorData | undefined>> =
    {
      attributeId: checkMandatoryString(row.attributeId),
      name: checkMandatoryString(row.name),
    };
  return {
    isSavingAllowed:
      !errorData.attributeId && !errorData.name && !!row.valueType,
    errorData,
  };
};

export const isAttributeRow = (
  row: Partial<AttributeRow>
): row is AttributeRow => {
  const { isSavingAllowed } = isSavingAttributeAllowed(row);
  return isSavingAllowed;
};

export const isSavingHashtagAllowed = (row: Partial<HashtagRow>) => {
  const errorData: Partial<Record<keyof HashtagRow, ErrorData | undefined>> = {
    tagId: checkMandatoryString(row.tagId),
    name: checkMandatoryString(row.name),
  };
  return {
    isSavingAllowed: !errorData.tagId && !errorData.name,
    errorData,
  };
};

export const isHashtagRow = (row: Partial<HashtagRow>): row is HashtagRow => {
  const { isSavingAllowed } = isSavingHashtagAllowed(row);
  return isSavingAllowed;
};

export const isSavingCostunitAllowed = (row: Partial<CostunitRow>) => {
  const errorData: Partial<Record<keyof CostunitRow, ErrorData | undefined>> = {
    unitId: checkMandatoryString(row.unitId),
    name: checkMandatoryString(row.name),
  };
  return {
    isSavingAllowed: !errorData.unitId && !errorData.name,
    errorData,
  };
};

export const isCostunitRow = (
  row: Partial<CostunitRow>
): row is CostunitRow => {
  const { isSavingAllowed } = isSavingCostunitAllowed(row);
  return isSavingAllowed;
};

export const isSavingImageContentAllowed = (row: Partial<ImageContentRow>) => {
  const errorData: Partial<
    Record<keyof ImageContentRow, ErrorData | undefined>
  > = {
    imageId: checkMandatoryString(row.imageId),
  };
  return {
    isSavingAllowed: !errorData.imageId,
    errorData,
  };
};

export const isImageContentRow = (
  row: Partial<ImageContentRow>
): row is ImageContentRow => {
  const { isSavingAllowed } = isSavingImageContentAllowed(row);
  return isSavingAllowed;
};

export const isSavingReceiverAllowed = (row: Partial<ReceiverRow>) => {
  const errorData: Partial<Record<keyof ReceiverRow, ErrorData | undefined>> = {
    receiverId: checkMandatoryString(row.receiverId),
    name: checkMandatoryString(row.name),
  };
  return {
    isSavingAllowed:
      !errorData.receiverId && !errorData.name && !!row.mailAddress,
    errorData,
  };
};

export const isReceiverRow = (
  row: Partial<ReceiverRow>
): row is ReceiverRow => {
  const { isSavingAllowed } = isSavingReceiverAllowed(row);
  return isSavingAllowed;
};

export const isSavingManufacturerAllowed = (row: Partial<ManufacturerRow>) => {
  const errorData: Partial<
    Record<keyof ManufacturerRow, ErrorData | undefined>
  > = {
    manufacturerId: checkMandatoryString(row.manufacturerId),
    name: checkMandatoryString(row.name),
  };
  return {
    isSavingAllowed: !errorData.manufacturerId && !errorData.name,
    errorData,
  };
};

export const isManufacturerRow = (
  row: Partial<ManufacturerRow>
): row is ManufacturerRow => {
  const { isSavingAllowed } = isSavingManufacturerAllowed(row);
  return isSavingAllowed;
};

export const isSavingStoreAllowed = (row: Partial<StoreRow>) => {
  const errorData: Partial<Record<keyof StoreRow, ErrorData | undefined>> = {
    storeId: checkMandatoryString(row.storeId),
    name: checkMandatoryString(row.name),
  };
  return {
    isSavingAllowed: !errorData.storeId && !errorData.name,
    errorData,
  };
};

export const isStoreRow = (row: Partial<StoreRow>): row is StoreRow => {
  const { isSavingAllowed } = isSavingStoreAllowed(row);
  return isSavingAllowed;
};

export const isSavingStoreSectionAllowed = (row: Partial<StoreSectionRow>) => {
  const errorData: Partial<
    Record<keyof StoreSectionRow, ErrorData | undefined>
  > = {
    sectionId: checkMandatoryString(row.sectionId),
    storeId: checkMandatoryString(row.storeId),
    name: checkMandatoryString(row.name),
    shortId: checkMandatoryString(row.shortId),
  };
  return {
    isSavingAllowed:
      !errorData.sectionId &&
      !errorData.name &&
      !errorData.storeId &&
      !errorData.shortId,
    errorData,
  };
};

export const isStoreSectionRow = (
  row: Partial<StoreSectionRow>
): row is StoreSectionRow => {
  const { isSavingAllowed } = isSavingStoreSectionAllowed(row);
  return isSavingAllowed;
};

export const isSavingReceiptAllowed = (row: Partial<ReceiptRow>) => {
  const errorData: Partial<Record<keyof ReceiptRow, ErrorData | undefined>> = {
    sectionId: checkMandatoryString(row.sectionId),
    articleId: checkMandatoryString(row.articleId),
    costUnit: checkMandatoryString(row.costUnit),
    reason: checkMandatoryString(row.reason),
    articleCount: ckeckPositiveNumber(row.articleCount),
  };
  return {
    isSavingAllowed:
      !errorData.sectionId &&
      !errorData.articleId &&
      !errorData.costUnit &&
      !errorData.reason &&
      !errorData.articleCount,
    errorData,
  };
};

export const isReceiptRow = (row: Partial<ReceiptRow>): row is ReceiptRow => {
  const { isSavingAllowed } = isSavingReceiptAllowed(row);
  return isSavingAllowed;
};

export const isSavingEmissionAllowed = (row: Partial<EmissionRow>) => {
  const errorData: Partial<Record<keyof EmissionRow, ErrorData | undefined>> = {
    sectionId: checkMandatoryString(row.sectionId),
    articleId: checkMandatoryString(row.articleId),
    costUnit: checkMandatoryString(row.costUnit),
    reason: checkMandatoryString(row.reason),
    receiver: checkMandatoryString(row.receiver),
    articleCount: ckeckPositiveNumber(row.articleCount),
  };
  return {
    isSavingAllowed:
      !errorData.sectionId &&
      !errorData.articleId &&
      !errorData.costUnit &&
      !errorData.reason &&
      !errorData.articleCount &&
      !errorData.receiver,
    errorData,
  };
};

export const isEmissionRow = (
  row: Partial<EmissionRow>
): row is EmissionRow => {
  const { isSavingAllowed } = isSavingEmissionAllowed(row);
  return isSavingAllowed;
};

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

export const compareAttributeRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<AttributeRow>
> = {
  attributeId: (direction: OrderDirection) =>
    compareString<AttributeRow>("attributeId", direction),
  name: (direction: OrderDirection) =>
    compareString<AttributeRow>("name", direction),
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

export const compareManufacturerRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<ManufacturerRow>
> = {
  manufacturerId: (direction: OrderDirection) =>
    compareString<ManufacturerRow>("manufacturerId", direction),
  name: (direction: OrderDirection) =>
    compareString<ManufacturerRow>("name", direction),
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

export const compareCostunitRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<CostunitRow>
> = {
  tagId: (direction: OrderDirection) =>
    compareString<CostunitRow>("unitId", direction),
  name: (direction: OrderDirection) =>
    compareString<CostunitRow>("name", direction),
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

export const compareStockChangingRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<StockChangingRow>
> = {
  articleId: (direction: OrderDirection) =>
    compareString<StockChangingRow>("articleId", direction),
  sectionId: (direction: OrderDirection) =>
    compareString<StockChangingRow>("sectionId", direction),
  articleCount: (direction: OrderDirection) =>
    compareNumber<StockChangingRow>("count", direction),
  at: (direction: OrderDirection) =>
    compareDate<StockChangingRow>("at", direction),
};

export const compareMasterdataChangeRow: Record<
  string,
  (direction: OrderDirection) => CompareFunction<MasterdataChangeRow>
> = {
  id: (direction: OrderDirection) =>
    compareString<MasterdataChangeRow>("id", direction),
  what: (direction: OrderDirection) =>
    compareString<MasterdataChangeRow>("what", direction),
  editedAt: (direction: OrderDirection) =>
    compareDate<MasterdataChangeRow>("editedAt", direction),
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

export const toRawAttribute = (row: AttributeRow): Row_Attribute => {
  return {
    attribute_id: row.attributeId,
    name: row.name,
    value_type: row.valueType,
    value_unit: row.valueUnit || null,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawAttribute = (raw: Row_Attribute): AttributeRow => {
  return {
    attributeId: raw.attribute_id,
    name: raw.name,
    valueType: raw.value_type,
    valueUnit: raw.value_unit || undefined,
    ...fromRawMasterdataFields(raw),
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
    manufacturer: row.manufacturer,
    attributes: row.attributes ? JSON.stringify(row.attributes) : null,
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
    manufacturer: raw.manufacturer,
    attributes: raw.attributes ? JSON.parse(raw.attributes) : undefined,
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

export const toRawCostunit = (row: CostunitRow): Row_Costunit => {
  return {
    unit_id: row.unitId,
    name: row.name,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawCostunit = (raw: Row_Costunit): CostunitRow => {
  return {
    unitId: raw.unit_id,
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

export const toRawManufacturer = (row: ManufacturerRow): Row_Manufacturer => {
  return {
    manufacturer_id: row.manufacturerId,
    name: row.name,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawManufacturer = (raw: Row_Manufacturer): ManufacturerRow => {
  return {
    manufacturerId: raw.manufacturer_id,
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
    short_id: row.shortId,
    image_refs: row.imageRefs ? JSON.stringify(row.imageRefs) : null,
    ...toRawMasterdataFields(row),
  };
};

export const fromRawStoreSection = (raw: Row_StoreSection): StoreSectionRow => {
  return {
    sectionId: raw.section_id,
    storeId: raw.store_id,
    name: raw.name,
    shortId: raw.short_id,
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
    imageRefs: raw.image_refs ? JSON.parse(raw.image_refs) : undefined,
    costUnit: raw.cost_unit,
    price: raw.price || undefined,
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
    cost_unit: row.costUnit,
    image_refs: row.imageRefs ? JSON.stringify(row.imageRefs) : null,
    price: typeof row.price === "number" ? row.price : null,
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
    costUnit: raw.cost_unit,
    price: typeof raw.price === "number" ? raw.price : undefined,
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
    cost_unit: row.costUnit,
    price: typeof row.price === "number" ? row.price : null,
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

export interface MasterdataChangeRow {
  id: string;
  what: string;
  createdAt: Date;
  editedAt: Date;
}

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

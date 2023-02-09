import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { ErrorData } from "../components/ErrorDisplays";
import {
  ArticleRow,
  AttributeRow,
  CostunitRow,
  fromRawArticle,
  fromRawAttribute,
  fromRawCostunit,
  fromRawHashtag,
  fromRawImageContent,
  fromRawManufacturer,
  fromRawReceiver,
  fromRawStore,
  fromRawStoreSection,
  HashtagRow,
  ImageContentRow,
  ManufacturerRow,
  ReceiverRow,
  StoreRow,
  StoreSectionRow,
} from "../types/RowTypes";
import { useArticleSelect } from "./useArticleSelect";
import { useAttributeSelect } from "./useAttributeSelect";
import { useCostunitSelect } from "./useCostunitSelect";
import { useHashtagSelect } from "./useHashtagSelect";
import { useImageContentSelect } from "./useImageContentSelect";
import { useManufacturerSelect } from "./useManufacturerSelect";
import { useReceiverSelect } from "./useReceiverSelect";
import { useStoreSectionSelect } from "./useStoreSectionSelect";
import { useStoreSelect } from "./useStoreSelect";

export interface Masterdata {
  errors: Record<string, ErrorData>;
  rows: {
    articleRows?: ArticleRow[];
    hashtagRows?: HashtagRow[];
    manufacturerRows?: ManufacturerRow[];
    attributeRows?: AttributeRow[];
    storeRows?: StoreRow[];
    sectionRows?: StoreSectionRow[];
    costunitRows?: CostunitRow[];
    receiverRows?: ReceiverRow[];
    imageContentRows?: ImageContentRow[];
  };
}
export const useMasterdata = (
  apiUrl: string,
  what: {
    article?: boolean;
    hashtag?: boolean;
    manufacturer?: boolean;
    attribute?: boolean;
    store?: boolean;
    section?: boolean;
    costunit?: boolean;
    receiver?: boolean;
    imageContent?: boolean;
  },
  updateIndicator: number,
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void
) => {
  const [masterdata, setMasterdata] = useState<Masterdata>({
    errors: {},
    rows: {},
  });

  const {
    article,
    hashtag,
    manufacturer,
    attribute,
    store,
    section,
    costunit,
    receiver,
    imageContent,
  } = what;

  const storeApiResponse = useStoreSelect(
    apiUrl,
    "%",
    store ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: storeResponse } = storeApiResponse;
  const { result: storeResult } = storeResponse || {};
  const { rows: storeRows } = storeResult || {};

  const articleApiResponse = useArticleSelect(
    apiUrl,
    "%",
    article ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const { rows: articleRows } = articleResult || {};

  const imageContentApiResponse = useImageContentSelect(
    apiUrl,
    "%",
    imageContent ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: imageContentResponse } = imageContentApiResponse;
  const { result: imageContentResult } = imageContentResponse || {};
  const { rows: imageContentRows } = imageContentResult || {};

  const receiverApiResponse = useReceiverSelect(
    apiUrl,
    "%",
    receiver ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: receiverResponse } = receiverApiResponse;
  const { result: receiverResult } = receiverResponse || {};
  const { rows: receiverRows } = receiverResult || {};

  const costunitApiResponse = useCostunitSelect(
    apiUrl,
    "%",
    costunit ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: costunitResponse } = costunitApiResponse;
  const { result: costunitResult } = costunitResponse || {};
  const { rows: costunitRows } = costunitResult || {};

  const sectionApiResponse = useStoreSectionSelect(
    apiUrl,
    "%",
    section ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: sectionResponse } = sectionApiResponse;
  const { result: sectionResult } = sectionResponse || {};
  const { rows: sectionRows } = sectionResult || {};

  const attributeApiResponse = useAttributeSelect(
    apiUrl,
    "%",
    attribute ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: attributeResponse } = attributeApiResponse;
  const { result: attributeResult } = attributeResponse || {};
  const { rows: attributeRows } = attributeResult || {};

  const hashtagApiResponse = useHashtagSelect(
    apiUrl,
    "%",
    hashtag ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: hashtagResponse } = hashtagApiResponse;
  const { result: hashtagResult } = hashtagResponse || {};
  const { rows: hashtagRows } = hashtagResult || {};

  const manufacturerApiResponse = useManufacturerSelect(
    apiUrl,
    "%",
    manufacturer ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: manufacturerResponse } = manufacturerApiResponse;
  const { result: manufacturerResult } = manufacturerResponse || {};
  const { rows: manufacturerRows } = manufacturerResult || {};

  useEffect(() => {
    const newRows = hashtagRows?.map((r) => fromRawHashtag(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, hashtagRows: newRows },
    }));
  }, [hashtagRows]);

  useEffect(() => {
    const newRows = manufacturerRows?.map((r) => fromRawManufacturer(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, manufacturerRows: newRows },
    }));
  }, [manufacturerRows]);

  useEffect(() => {
    const newRows = articleRows?.map((r) => fromRawArticle(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, articleRows: newRows },
    }));
  }, [articleRows]);

  useEffect(() => {
    const newRows = imageContentRows?.map((r) => fromRawImageContent(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, imageContentRows: newRows },
    }));
  }, [imageContentRows]);

  useEffect(() => {
    const newRows = receiverRows?.map((r) => fromRawReceiver(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, receiverRows: newRows },
    }));
  }, [receiverRows]);

  useEffect(() => {
    const newRows = costunitRows?.map((r) => fromRawCostunit(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, costunitRows: newRows },
    }));
  }, [costunitRows]);

  useEffect(() => {
    const newRows = sectionRows?.map((r) => fromRawStoreSection(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, sectionRows: newRows },
    }));
  }, [sectionRows]);

  useEffect(() => {
    const newRows = storeRows?.map((r) => fromRawStore(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, storeRows: newRows },
    }));
  }, [storeRows]);

  useEffect(() => {
    const newRows = attributeRows?.map((r) => fromRawAttribute(r));
    setMasterdata((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, attributeRows: newRows },
    }));
  }, [attributeRows]);

  useEffect(() => {
    articleApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, article: articleApiResponse },
        rows: previous.rows,
      }));
  }, [articleApiResponse]);

  useEffect(() => {
    imageContentApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, imageContent: imageContentApiResponse },
        rows: previous.rows,
      }));
  }, [imageContentApiResponse]);

  useEffect(() => {
    receiverApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, receiver: receiverApiResponse },
        rows: previous.rows,
      }));
  }, [receiverApiResponse]);

  useEffect(() => {
    costunitApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, costunit: costunitApiResponse },
        rows: previous.rows,
      }));
  }, [costunitApiResponse]);

  useEffect(() => {
    sectionApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, section: sectionApiResponse },
        rows: previous.rows,
      }));
  }, [sectionApiResponse]);

  useEffect(() => {
    storeApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, store: storeApiResponse },
        rows: previous.rows,
      }));
  }, [storeApiResponse]);

  useEffect(() => {
    attributeApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, attribute: attributeApiResponse },
        rows: previous.rows,
      }));
  }, [attributeApiResponse]);

  useEffect(() => {
    attributeApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, attribute: attributeApiResponse },
        rows: previous.rows,
      }));
  }, [attributeApiResponse]);

  useEffect(() => {
    hashtagApiResponse.error &&
      setMasterdata((previous) => ({
        errors: { ...previous.errors, hashtag: hashtagApiResponse },
        rows: previous.rows,
      }));
  }, [hashtagApiResponse]);

  return masterdata;
};

import {
  ErrorCode,
  Row_Article,
  Row_Attribute,
  Row_Costunit,
  Row_Hashtag,
  Row_ImageContent,
  Row_Manufacturer,
  Row_Receiver,
  Row_Store,
  Row_StoreSection,
} from "jm-castle-warehouse-types/build";
import { DateTime } from "luxon";
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
import { useMasterdataSingleEditedByInterval } from "./useMasterdataSingleEditedByInterval";

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
export const useMasterdataEditedbyInterval = (
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
  from: DateTime,
  to: DateTime,
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

  const storeApiResponse = useMasterdataSingleEditedByInterval<Row_Store>(
    apiUrl,
    "store",
    from,
    to,
    store ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: storeResponse } = storeApiResponse;
  const { result: storeResult } = storeResponse || {};
  const { rows: storeRows } = storeResult || {};

  const articleApiResponse = useMasterdataSingleEditedByInterval<Row_Article>(
    apiUrl,
    "article",
    from,
    to,
    article ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const { rows: articleRows } = articleResult || {};

  const imageContentApiResponse =
    useMasterdataSingleEditedByInterval<Row_ImageContent>(
      apiUrl,
      "image_content",
      from,
      to,
      imageContent ? updateIndicator : 0,
      handleExpiredToken
    );
  const { response: imageContentResponse } = imageContentApiResponse;
  const { result: imageContentResult } = imageContentResponse || {};
  const { rows: imageContentRows } = imageContentResult || {};

  const receiverApiResponse = useMasterdataSingleEditedByInterval<Row_Receiver>(
    apiUrl,
    "receiver",
    from,
    to,
    receiver ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: receiverResponse } = receiverApiResponse;
  const { result: receiverResult } = receiverResponse || {};
  const { rows: receiverRows } = receiverResult || {};

  const costunitApiResponse = useMasterdataSingleEditedByInterval<Row_Costunit>(
    apiUrl,
    "costunit",
    from,
    to,
    costunit ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: costunitResponse } = costunitApiResponse;
  const { result: costunitResult } = costunitResponse || {};
  const { rows: costunitRows } = costunitResult || {};

  const sectionApiResponse =
    useMasterdataSingleEditedByInterval<Row_StoreSection>(
      apiUrl,
      "store_section",
      from,
      to,
      section ? updateIndicator : 0,
      handleExpiredToken
    );
  const { response: sectionResponse } = sectionApiResponse;
  const { result: sectionResult } = sectionResponse || {};
  const { rows: sectionRows } = sectionResult || {};

  const attributeApiResponse =
    useMasterdataSingleEditedByInterval<Row_Attribute>(
      apiUrl,
      "attribute",
      from,
      to,
      attribute ? updateIndicator : 0,
      handleExpiredToken
    );
  const { response: attributeResponse } = attributeApiResponse;
  const { result: attributeResult } = attributeResponse || {};
  const { rows: attributeRows } = attributeResult || {};

  const hashtagApiResponse = useMasterdataSingleEditedByInterval<Row_Hashtag>(
    apiUrl,
    "hashtag",
    from,
    to,
    hashtag ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: hashtagResponse } = hashtagApiResponse;
  const { result: hashtagResult } = hashtagResponse || {};
  const { rows: hashtagRows } = hashtagResult || {};

  const manufacturerApiResponse =
    useMasterdataSingleEditedByInterval<Row_Manufacturer>(
      apiUrl,
      "manufacturer",
      from,
      to,
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

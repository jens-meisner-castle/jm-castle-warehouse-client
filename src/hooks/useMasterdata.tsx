import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { ErrorData } from "../components/ErrorDisplays";
import {
  ArticleRow,
  AttributeRow,
  fromRawArticle,
  fromRawAttribute,
  fromRawHashtag,
  fromRawManufacturer,
  HashtagRow,
  ManufacturerRow,
} from "../types/RowTypes";
import { useArticleSelect } from "./useArticleSelect";
import { useAttributeSelect } from "./useAttributeSelect";
import { useHashtagSelect } from "./useHashtagSelect";
import { useManufacturerSelect } from "./useManufacturerSelect";

export interface Masterdata {
  errors: Record<string, ErrorData>;
  rows: {
    articleRows?: ArticleRow[];
    hashtagRows?: HashtagRow[];
    manufacturerRows?: ManufacturerRow[];
    attributeRows?: AttributeRow[];
  };
}
export const useMasterdata = (
  apiUrl: string,
  what: {
    article?: boolean;
    hashtag?: boolean;
    manufacturer?: boolean;
    attribute?: boolean;
  },
  updateIndicator: number,
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void
) => {
  const [masterdata, setMasterdata] = useState<Masterdata>({
    errors: {},
    rows: {},
  });

  const { article, hashtag, manufacturer, attribute } = what;

  const articleApiResponse = useArticleSelect(
    apiUrl,
    "%",
    article ? updateIndicator : 0,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const { rows: articleRows } = articleResult || {};

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

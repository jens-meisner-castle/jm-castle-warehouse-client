import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { ErrorData } from "../../../components/ErrorDisplays";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useHashtagSelect } from "../../../hooks/useHashtagSelect";
import {
  ArticleRow,
  fromRawArticle,
  fromRawHashtag,
  HashtagRow,
} from "../../../types/RowTypes";

export interface PageData {
  errors: Record<string, ErrorData>;
  rows: { articleRows?: ArticleRow[]; hashtagRows?: HashtagRow[] };
}
export const usePageData = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void
) => {
  const [pageData, setPageData] = useState<PageData>({
    errors: {},
    rows: {},
  });

  const articleApiResponse = useArticleSelect(
    apiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const { rows: articleRows } = articleResult || {};

  const hashtagApiResponse = useHashtagSelect(
    apiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: hashtagResponse } = hashtagApiResponse;
  const { result: hashtagResult } = hashtagResponse || {};
  const { rows: hashtagRows } = hashtagResult || {};

  useEffect(() => {
    const newRows = articleRows?.map((r) => fromRawArticle(r));
    setPageData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, articleRows: newRows },
    }));
  }, [articleRows]);

  useEffect(() => {
    articleApiResponse.error &&
      setPageData((previous) => ({
        errors: { ...previous.errors, article: articleApiResponse },
        rows: previous.rows,
      }));
  }, [articleApiResponse]);

  useEffect(() => {
    const newRows = hashtagRows?.map((r) => fromRawHashtag(r));
    setPageData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, hashtagRows: newRows },
    }));
  }, [hashtagRows]);

  useEffect(() => {
    hashtagApiResponse.error &&
      setPageData((previous) => ({
        errors: { ...previous.errors, hashtag: hashtagApiResponse },
        rows: previous.rows,
      }));
  }, [hashtagApiResponse]);

  return pageData;
};

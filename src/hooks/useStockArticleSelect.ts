import {
  ApiServiceResponse,
  ArticleStockState,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useStockArticleSelect = (
  apiUrl: string,
  article_id: string | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<ArticleStockState> | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (!updateIndicator || !article_id) {
      return;
    }
    const options = defaultFetchOptions(token);
    const url = `${apiUrl}/stock/article/select?article_id=${article_id}`;
    fetch(url, options)
      .then((response) => {
        response.json().then((obj: ApiServiceResponse<ArticleStockState>) => {
          const { response, error, errorDetails, errorCode } = obj || {};
          if (handleExpiredToken) {
            handleExpiredToken(errorCode);
          }
          if (error) {
            return setQueryStatus({ error, errorCode, errorDetails });
          }
          if (response) {
            return setQueryStatus({
              response,
            });
          }
          return setQueryStatus({
            errorCode: UnknownErrorCode,
            error: `Received no error and undefined result.`,
          });
        });
      })
      .catch((error) => {
        setQueryStatus({
          errorCode: UnknownErrorCode,
          error: error.toString(),
        });
      });
  }, [apiUrl, updateIndicator, article_id, token, handleExpiredToken]);
  return queryStatus;
};

import { InsertResponse, Row_Article } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param name Filter from (seconds of a date)
 * @param updateIndicator change to re-select (0 => no fetch)
 * @returns
 */
export const useArticleInsert = (
  apiUrl: string,
  article: Row_Article | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | InsertResponse<Row_Article>
    | {
        result: undefined;
        error: undefined;
        errorDetails?: Record<string, unknown>;
      }
  >({
    result: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (updateIndicator) {
      if (article) {
        const options = defaultFetchOptions();
        options.method = "POST";
        options.body = JSON.stringify(article);
        options.headers = options.headers
          ? { ...options.headers, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };
        const url = `${apiUrl}/article/insert?article_id=${article.article_id}`;
        setQueryStatus({ result: undefined, error: undefined });
        fetch(url, options)
          .then((response) => {
            response.json().then((obj) => {
              const { response, error, errorDetails } = obj || {};
              const { result } = response || {};
              setQueryStatus({
                error,
                result,
                errorDetails,
              });
            });
          })
          .catch((error) => {
            console.error(error);
            setQueryStatus((previous) => ({
              error: error.toString(),
              result: previous.result,
            }));
          });
      } else {
        setQueryStatus((previous) =>
          previous.error || previous.result
            ? { result: undefined, error: undefined }
            : previous
        );
      }
    }
  }, [apiUrl, updateIndicator, article]);
  return queryStatus;
};

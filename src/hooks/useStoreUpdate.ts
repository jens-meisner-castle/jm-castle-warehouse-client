import { Row_Store, UpdateResponse } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param name Filter from (seconds of a date)
 * @param updateIndicator change to re-select (0 => no fetch)
 * @returns
 */
export const useStoreUpdate = (
  apiUrl: string,
  store: Row_Store | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | UpdateResponse<Row_Store>
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
      if (store) {
        const options = defaultFetchOptions();
        options.method = "POST";
        options.body = JSON.stringify(store);
        options.headers = options.headers
          ? { ...options.headers, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };
        const url = `${apiUrl}/store/update?store_id=${store.store_id}`;
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
  }, [apiUrl, updateIndicator, store]);
  return queryStatus;
};

import {
  ApiServiceResponse,
  ErrorCode,
  InsertResponse,
  Row_Store,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param name Filter from (seconds of a date)
 * @param updateIndicator change to re-select (0 => no fetch)
 * @returns
 */
export const useStoreInsert = (
  apiUrl: string,
  store: Row_Store | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<InsertResponse<Row_Store>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    if (!updateIndicator) return;
    if (!store) {
      return setQueryStatus((previous) =>
        previous.error || previous.response ? { response: undefined } : previous
      );
    }
    const options = defaultFetchOptions();
    options.method = "POST";
    options.body = JSON.stringify(store);
    options.headers = options.headers
      ? { ...options.headers, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
    const url = `${apiUrl}/store/insert?store_id=${store.store_id}`;
    setQueryStatus({ response: undefined });
    fetch(url, options)
      .then((response) => {
        response
          .json()
          .then((obj: ApiServiceResponse<InsertResponse<Row_Store>>) => {
            const { response, error, errorDetails, errorCode } = obj || {};
            if (handleExpiredToken) {
              handleExpiredToken(errorCode);
            }
            if (error) {
              return setQueryStatus({ error, errorCode, errorDetails });
            }
            const { result } = response || {};
            if (result) {
              return setQueryStatus({
                response: { result },
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
  }, [apiUrl, updateIndicator, store, handleExpiredToken]);
  return queryStatus;
};

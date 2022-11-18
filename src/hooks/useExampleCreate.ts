import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param name Filter from (seconds of a date)
 * @param updateIndicator change to re-select (0 => no fetch)
 * @returns
 */
export const useExampleCreate = (
  apiUrl: string,
  name: string | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | { result: Record<string, unknown[]>; error?: never; errorDetails?: never }
    | { result?: never; error: string; errorDetails?: Record<string, unknown> }
    | {
        result: undefined;
        error: undefined;
        errorDetails: undefined;
      }
  >({
    result: undefined,
    error: undefined,
    errorDetails: undefined,
  });

  useEffect(() => {
    if (updateIndicator && name) {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/example/create?name=${name}`;
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
            errorDetails: undefined,
          }));
        });
    }
  }, [apiUrl, updateIndicator, name]);
  return queryStatus;
};

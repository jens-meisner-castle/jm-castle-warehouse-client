import {
  Row_StoreSection,
  SelectResponse,
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
export const useStoreSectionSelect = (
  apiUrl: string,
  nameFragment: string | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | SelectResponse<Row_StoreSection>
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
      const options = defaultFetchOptions();
      const url = `${apiUrl}/store-section/select?name=${nameFragment || "%"}`;
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
    }
  }, [apiUrl, updateIndicator, nameFragment]);
  return queryStatus;
};

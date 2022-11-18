import {
  Row_StoreSection,
  UpdateResponse,
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
export const useStoreSectionUpdate = (
  apiUrl: string,
  section: Row_StoreSection | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | UpdateResponse<Row_StoreSection>
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
      if (section) {
        const options = defaultFetchOptions();
        options.method = "POST";
        options.body = JSON.stringify(section);
        options.headers = options.headers
          ? { ...options.headers, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };
        const url = `${apiUrl}/store-section/update?section_id=${section.section_id}`;
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
  }, [apiUrl, updateIndicator, section]);
  return queryStatus;
};

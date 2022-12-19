import {
  ApiServiceResponse,
  Row_StoreSection,
  TokenExpiredErrorCode,
  UnknownErrorCode,
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
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<UpdateResponse<Row_StoreSection>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    if (!updateIndicator) {
      return setQueryStatus({ response: undefined });
    }
    if (!section) {
      return setQueryStatus((previous) =>
        previous.error || previous.response ? { response: undefined } : previous
      );
    }
    const options = defaultFetchOptions();
    options.method = "POST";
    options.body = JSON.stringify(section);
    options.headers = options.headers
      ? { ...options.headers, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
    const url = `${apiUrl}/store-section/update?section_id=${section.section_id}`;
    setQueryStatus({ response: undefined });
    fetch(url, options)
      .then((response) => {
        response
          .json()
          .then((obj: ApiServiceResponse<UpdateResponse<Row_StoreSection>>) => {
            const { response, error, errorDetails, errorCode } = obj || {};
            if (handleExpiredToken && errorCode === TokenExpiredErrorCode) {
              handleExpiredToken();
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
  }, [apiUrl, updateIndicator, section, handleExpiredToken]);
  return queryStatus;
};

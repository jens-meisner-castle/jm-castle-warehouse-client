import {
  ApiServiceResponse,
  Row_StoreSection,
  SelectResponse,
  TokenExpiredErrorCode,
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
export const useStoreSectionSelect = (
  apiUrl: string,
  nameFragment: string | undefined,
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<SelectResponse<Row_StoreSection>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    if (updateIndicator) {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/store-section/select?name=${nameFragment || "%"}`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then(
              (obj: ApiServiceResponse<SelectResponse<Row_StoreSection>>) => {
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
              }
            );
        })
        .catch((error) => {
          setQueryStatus({
            errorCode: UnknownErrorCode,
            error: error.toString(),
          });
        });
    }
  }, [apiUrl, updateIndicator, nameFragment, handleExpiredToken]);
  return queryStatus;
};

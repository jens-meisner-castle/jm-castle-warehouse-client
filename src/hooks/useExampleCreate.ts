import {
  ApiServiceResponse,
  TokenExpiredErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useDefaultFetchOptions } from "./options/Utils";

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
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<{ result: Record<string, unknown> } | undefined>
  >({ response: undefined });
  const options = useDefaultFetchOptions();
  useEffect(() => {
    if (updateIndicator && name) {
      const url = `${apiUrl}/example/create?name=${name}`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then(
              (
                obj: ApiServiceResponse<{ result: Record<string, unknown> }>
              ) => {
                const { response, error, errorDetails, errorCode } = obj || {};
                if (handleExpiredToken && errorCode === TokenExpiredErrorCode) {
                  handleExpiredToken();
                }
                if (error) {
                  return setQueryStatus({ error, errorCode, errorDetails });
                }
                if (!response) {
                  return setQueryStatus({
                    errorCode: UnknownErrorCode,
                    error: "Received no error and undefined result.",
                  });
                }
                setQueryStatus({ response });
              }
            );
        })
        .catch((error) => {
          setQueryStatus({
            error: error.toString(),
            errorCode: UnknownErrorCode,
          });
        });
    }
  }, [apiUrl, updateIndicator, name, options, handleExpiredToken]);
  return queryStatus;
};

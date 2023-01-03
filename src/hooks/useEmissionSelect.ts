import {
  ApiServiceResponse,
  ErrorCode,
  Row_Emission,
  SelectResponse,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param logged_at_from Filter from (seconds of a date)
 * @param logged_at_to Filter to (seconds of a date)
 * @param updateIndicator change to re-select (0 => no fetch)
 * @returns
 */
export const useEmissionSelect = (
  apiUrl: string,
  from: DateTime,
  to: DateTime,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<SelectResponse<Row_Emission>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    if (updateIndicator) {
      const options = defaultFetchOptions();
      const at_from = Math.floor(from.toMillis() / 1000);
      const at_to = Math.ceil(to.toMillis() / 1000);
      const url = `${apiUrl}/emission/select?at_from=${at_from}&at_to=${at_to}`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((obj: ApiServiceResponse<SelectResponse<Row_Emission>>) => {
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
    }
  }, [apiUrl, updateIndicator, from, to, handleExpiredToken]);
  return queryStatus;
};

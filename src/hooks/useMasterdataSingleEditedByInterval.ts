import {
  ApiServiceResponse,
  ErrorCode,
  SelectResponse,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { Row_Masterdata } from "jm-castle-warehouse-types/build";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";
export const useMasterdataSingleEditedByInterval = <T extends Row_Masterdata>(
  apiUrl: string,
  source:
    | "article"
    | "store"
    | "image_content"
    | "receiver"
    | "costunit"
    | "store_section"
    | "attribute"
    | "hashtag"
    | "manufacturer",
  from: DateTime,
  to: DateTime,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SelectResponse<T>> | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator) {
      const options = defaultFetchOptions(token);
      const at_from = Math.floor(from.toMillis() / 1000);
      const at_to = Math.ceil(to.toMillis() / 1000);
      const url = `${apiUrl}/masterdata/select/interval?source=${source}&at_from=${at_from}&at_to=${at_to}`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj: ApiServiceResponse<SelectResponse<T>>) => {
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
  }, [apiUrl, updateIndicator, source, from, to, token, handleExpiredToken]);
  return queryStatus;
};

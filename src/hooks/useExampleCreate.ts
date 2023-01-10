import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useExampleCreate = (
  apiUrl: string,
  name: string | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<{ result: Record<string, unknown> } | undefined>
  >({ response: undefined });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator && name) {
      const options = defaultFetchOptions(token);
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
                if (handleExpiredToken) {
                  handleExpiredToken(errorCode);
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
  }, [apiUrl, updateIndicator, name, token, handleExpiredToken]);
  return queryStatus;
};

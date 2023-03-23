import { ApiServiceResponse, UnknownErrorCode } from "jm-castle-types/build";
import { VerifyTokenResult } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useVerifyToken = (apiUrl: string, updateIndicator: number) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<VerifyTokenResult> | ApiServiceResponse<undefined>
  >({ response: undefined });
  const token = useAuthorizationToken();

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (updateIndicator) {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/auth/token`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj: ApiServiceResponse<VerifyTokenResult>) => {
            const { response, error, errorCode, errorDetails } = obj || {};
            if (error) {
              return setQueryStatus({ error, errorCode, errorDetails });
            }
            const { expiresAtMs, expiresAtDisplay, roles, username } =
              response || {};
            if (!roles || !expiresAtDisplay || !expiresAtMs || !username) {
              return setQueryStatus({
                error: `Fatal error: Received verify token response without error and withpout payload.`,
                errorCode: UnknownErrorCode,
              });
            }
            setQueryStatus({
              response: {
                roles,
                expiresAtDisplay,
                expiresAtMs,
                username,
              },
            });
          });
        })
        .catch((error) => {
          setQueryStatus({ error: error.toString() });
        });
    }
  }, [apiUrl, updateIndicator, token]);
  return queryStatus;
};

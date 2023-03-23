import { ApiServiceResponse, UnknownErrorCode } from "jm-castle-types/build";
import { LoginResult } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export const useLoginClient = (
  apiUrl: string,
  clientId: string | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<LoginResult> | ApiServiceResponse<undefined>
  >({ response: undefined });

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (updateIndicator && clientId) {
      const options = defaultFetchOptions();
      options.headers = options.headers
        ? { ...options.headers, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };
      const url = `${apiUrl}/auth/client?client_id=${clientId}`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj: ApiServiceResponse<LoginResult>) => {
            const { response, error, errorCode, errorDetails } = obj || {};
            if (error) {
              return setQueryStatus({ error, errorCode, errorDetails });
            }
            const { token, expiresAtMs, expiresAtDisplay, roles, username } =
              response || {};
            if (
              !token ||
              !roles ||
              !expiresAtDisplay ||
              !expiresAtMs ||
              !username
            ) {
              return setQueryStatus({
                error: `Fatal error: Received client login response without error and withpout token.`,
                errorCode: UnknownErrorCode,
              });
            }
            setQueryStatus({
              response: {
                token,
                roles,
                expiresAtDisplay,
                expiresAtMs,
                username,
              },
            });
          });
        })
        .catch((error) => {
          console.error(error);
          setQueryStatus({ error: error.toString() });
        });
    }
  }, [clientId, updateIndicator, apiUrl]);
  return queryStatus;
};

import {
  ApiServiceResponse,
  LoginResult,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export interface LoginData {
  user: string;
  password: string;
}

export const useLoginBasic = (
  apiUrl: string,
  loginData: LoginData | undefined
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<LoginResult> | ApiServiceResponse<undefined>
  >({ response: undefined });

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (loginData) {
      const options = defaultFetchOptions();
      options.method = "POST";
      options.body = JSON.stringify(loginData);
      options.headers = options.headers
        ? { ...options.headers, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };
      const url = `${apiUrl}/auth/basic?user_id=${loginData.user}`;
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
                error: `Fatal error: Received basic login response without error and withpout token.`,
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
  }, [loginData, apiUrl]);
  return queryStatus;
};

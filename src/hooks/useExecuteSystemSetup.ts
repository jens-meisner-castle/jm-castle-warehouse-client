import {
  ApiServiceResponse,
  ExecuteSetupResponse,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export type ExecuteState = "not started" | "start";

export const useExecuteSystemSetup = (apiUrl: string, state: ExecuteState) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<ExecuteSetupResponse["setup"] | undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    if (state === "start") {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/system/setup`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((obj: ApiServiceResponse<ExecuteSetupResponse["setup"]>) => {
              const { response, error, errorCode, errorDetails } = obj || {};
              if (error)
                return setQueryStatus({
                  error,
                  errorCode,
                  errorDetails,
                });
              return setQueryStatus({ response });
            });
        })
        .catch((error) => {
          setQueryStatus({
            error: error.toString(),
            errorCode: UnknownErrorCode,
          });
        });
    }
  }, [apiUrl, state]);
  return queryStatus;
};

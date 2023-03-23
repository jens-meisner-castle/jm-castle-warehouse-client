import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { SystemControlResponse } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export type ControlAction = "restart" | "none";

export const useSystemControls = (
  apiUrl: string,
  action: ControlAction,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SystemControlResponse | undefined> & {
      action: ControlAction;
    }
  >({
    action: "none",
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    setQueryStatus({ action, response: undefined });
    if (action === "restart") {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/system/control/${action}`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((obj: ApiServiceResponse<SystemControlResponse>) => {
              const { response, error, errorCode, errorDetails } = obj;
              if (handleExpiredToken) {
                handleExpiredToken(errorCode);
              }
              if (error) {
                return setQueryStatus({
                  error,
                  errorCode,
                  errorDetails,
                  action,
                });
              }
              if (!response) {
                return setQueryStatus({
                  action,
                  errorCode: UnknownErrorCode,
                  errorDetails,
                  error: "Received no error and undefined response.",
                });
              }
              setQueryStatus({ action, response });
            });
        })
        .catch((error: Error) => {
          setQueryStatus({
            action,
            error: error.toString(),
            errorCode: UnknownErrorCode,
          });
        });
    }
  }, [apiUrl, action, token, handleExpiredToken]);
  return queryStatus;
};

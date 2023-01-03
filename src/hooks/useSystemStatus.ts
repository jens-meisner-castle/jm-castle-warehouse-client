import {
  ApiServiceResponse,
  ErrorCode,
  SystemStatus,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export interface SystemStatusQueryStatus {
  status: SystemStatus | undefined;
  error: string | undefined;
}
export const useSystemStatus = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SystemStatus | undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator > 0) {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/system/status`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj: ApiServiceResponse<SystemStatus>) => {
            const { error, response, errorCode, errorDetails } = obj || {};
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
            setQueryStatus({
              response,
            });
          });
        })
        .catch((error) => {
          setQueryStatus({
            error: error.toString(),
            errorCode: UnknownErrorCode,
          });
        });
    }
  }, [apiUrl, updateIndicator, token, handleExpiredToken]);
  return queryStatus;
};

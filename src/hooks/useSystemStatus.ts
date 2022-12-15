import {
  ApiServiceResponse,
  SystemStatus,
  TokenExpiredErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useDefaultFetchOptions } from "./options/Utils";

export interface SystemStatusQueryStatus {
  status: SystemStatus | undefined;
  error: string | undefined;
}
export const useSystemStatus = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SystemStatus | undefined>
  >({
    response: undefined,
  });
  const options = useDefaultFetchOptions();
  useEffect(() => {
    if (updateIndicator > 0) {
      const url = `${apiUrl}/system/status`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj: ApiServiceResponse<SystemStatus>) => {
            const { error, response, errorCode, errorDetails } = obj || {};
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
  }, [apiUrl, updateIndicator, options, handleExpiredToken]);
  return queryStatus;
};

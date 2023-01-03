import {
  ApiServiceResponse,
  ErrorCode,
  SystemSetupStatus,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export const useSystemSetupStatus = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SystemSetupStatus | undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    const options = defaultFetchOptions();
    const url = `${apiUrl}/system/setup-status`;
    fetch(url, options)
      .then((response) => {
        response.json().then((obj: ApiServiceResponse<SystemSetupStatus>) => {
          const { response, error, errorCode, errorDetails } = obj;
          if (handleExpiredToken) {
            handleExpiredToken(errorCode);
          }
          if (error) {
            return setQueryStatus({ error, errorCode, errorDetails });
          }
          if (!response) {
            return setQueryStatus({
              errorCode: UnknownErrorCode,
              errorDetails,
              error: "Received no error and undefined response.",
            });
          }
          return setQueryStatus({
            response,
          });
        });
      })
      .catch((error) => {
        return setQueryStatus({
          errorCode: UnknownErrorCode,
          error: error.toString(),
        });
      });
  }, [apiUrl, updateIndicator, handleExpiredToken]);
  return queryStatus;
};

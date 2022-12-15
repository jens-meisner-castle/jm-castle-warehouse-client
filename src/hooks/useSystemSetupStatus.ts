import {
  ApiServiceResponse,
  SystemSetupStatus,
  TokenExpiredErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useDefaultFetchOptions } from "./options/Utils";

export const useSystemSetupStatus = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SystemSetupStatus | undefined>
  >({
    response: undefined,
  });
  const options = useDefaultFetchOptions();
  useEffect(() => {
    const url = `${apiUrl}/system/setup-status`;
    fetch(url, options)
      .then((response) => {
        response.json().then((obj: ApiServiceResponse<SystemSetupStatus>) => {
          const { response, error, errorCode, errorDetails } = obj;
          if (handleExpiredToken && errorCode === TokenExpiredErrorCode) {
            handleExpiredToken();
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
  }, [apiUrl, updateIndicator, options, handleExpiredToken]);
  return queryStatus;
};

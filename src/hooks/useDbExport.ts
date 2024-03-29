import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { DbExportData } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useDbExport = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<DbExportData> | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator) {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/export/db/data`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj: ApiServiceResponse<DbExportData>) => {
            const { response, error, errorDetails, errorCode } = obj || {};
            if (handleExpiredToken) {
              handleExpiredToken(errorCode);
            }
            if (error) {
              return setQueryStatus({ error, errorCode, errorDetails });
            }
            if (response) {
              return setQueryStatus({
                response,
              });
            }
            return setQueryStatus({
              errorCode: UnknownErrorCode,
              error: `Received no error and undefined result.`,
            });
          });
        })
        .catch((error) => {
          setQueryStatus({
            errorCode: UnknownErrorCode,
            error: error.toString(),
          });
        });
    }
  }, [apiUrl, updateIndicator, token, handleExpiredToken]);
  return queryStatus;
};

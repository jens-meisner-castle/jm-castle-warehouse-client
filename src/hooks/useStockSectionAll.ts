import {
  ApiServiceResponse,
  ErrorCode,
  SectionStockState,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useStockSectionAll = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<Record<string, SectionStockState>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (!updateIndicator) {
      return;
    }
    const options = defaultFetchOptions(token);
    const url = `${apiUrl}/stock/section/all`;
    fetch(url, options)
      .then((response) => {
        response
          .json()
          .then(
            (obj: ApiServiceResponse<Record<string, SectionStockState>>) => {
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
            }
          );
      })
      .catch((error) => {
        setQueryStatus({
          errorCode: UnknownErrorCode,
          error: error.toString(),
        });
      });
  }, [apiUrl, updateIndicator, token, handleExpiredToken]);
  return queryStatus;
};

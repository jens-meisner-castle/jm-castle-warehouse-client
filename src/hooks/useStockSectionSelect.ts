import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { SectionStockState } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useStockSectionSelect = (
  apiUrl: string,
  sectionId: string | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<SectionStockState> | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (!updateIndicator || !sectionId) {
      return;
    }
    const options = defaultFetchOptions(token);
    const url = `${apiUrl}/stock/section/select?section_id=${sectionId}`;
    fetch(url, options)
      .then((response) => {
        response.json().then((obj: ApiServiceResponse<SectionStockState>) => {
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
  }, [apiUrl, updateIndicator, sectionId, token, handleExpiredToken]);
  return queryStatus;
};

import {
  ApiServiceResponse,
  ErrorCode,
  Row_Hashtag,
  SelectResponse,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useHashtagSelect = (
  apiUrl: string,
  nameFragment: string | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<SelectResponse<Row_Hashtag>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator) {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/hashtag/select?name=${nameFragment || "%"}`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((obj: ApiServiceResponse<SelectResponse<Row_Hashtag>>) => {
              const { response, error, errorDetails, errorCode } = obj || {};
              if (handleExpiredToken) {
                handleExpiredToken(errorCode);
              }
              if (error) {
                return setQueryStatus({ error, errorCode, errorDetails });
              }
              const { result } = response || {};
              if (result) {
                return setQueryStatus({
                  response: { result },
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
  }, [apiUrl, updateIndicator, nameFragment, token, handleExpiredToken]);
  return queryStatus;
};

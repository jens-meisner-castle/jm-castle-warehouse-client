import {
  ApiServiceResponse,
  ErrorCode,
  Row_ImageContent,
  SelectResponse,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useImageContentSelect = (
  apiUrl: string,
  imageIdFragment: string | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<SelectResponse<Row_ImageContent>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator) {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/image-content/rows?image_id=${
        imageIdFragment || "%"
      }`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then(
              (obj: ApiServiceResponse<SelectResponse<Row_ImageContent>>) => {
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
              }
            );
        })
        .catch((error) => {
          setQueryStatus({
            errorCode: UnknownErrorCode,
            error: error.toString(),
          });
        });
    }
  }, [apiUrl, updateIndicator, imageIdFragment, token, handleExpiredToken]);
  return queryStatus;
};

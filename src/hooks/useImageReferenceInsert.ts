import {
  ApiServiceResponse,
  InsertResponse,
  Row_ImageReference,
  TokenExpiredErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useDefaultFetchOptions } from "./options/Utils";

export const useImageReferenceInsert = (
  apiUrl: string,
  imageRef: Row_ImageReference | undefined,
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<InsertResponse<Row_ImageReference>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const options = useDefaultFetchOptions();
  useEffect(() => {
    if (!updateIndicator) return;
    if (!imageRef) {
      return setQueryStatus((previous) =>
        previous.error || previous.response ? { response: undefined } : previous
      );
    }
    options.method = "POST";
    options.body = JSON.stringify(imageRef);
    options.headers = options.headers
      ? { ...options.headers, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
    const url = `${apiUrl}/image-ref/insert?image_id=${imageRef.image_id}`;
    setQueryStatus({ response: undefined });
    fetch(url, options)
      .then((response) => {
        response
          .json()
          .then(
            (obj: ApiServiceResponse<InsertResponse<Row_ImageReference>>) => {
              const { response, error, errorDetails, errorCode } = obj || {};
              if (handleExpiredToken && errorCode === TokenExpiredErrorCode) {
                handleExpiredToken();
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
  }, [apiUrl, updateIndicator, imageRef, options, handleExpiredToken]);
  return queryStatus;
};
import {
  ApiServiceResponse,
  ErrorCode,
  InsertResponse,
  Row_ImageContent,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useImageContentInsert = (
  apiUrl: string,
  imageId: string | undefined,
  imageExtension: string | undefined,
  content: File | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<InsertResponse<Row_ImageContent>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator) {
      if (imageId && imageExtension && content) {
        const options = defaultFetchOptions(token);
        const formData = new FormData();
        formData.append("image_id", imageId);
        formData.append("image_extension", imageExtension);
        formData.append("file", content);
        options.method = "POST";
        options.body = formData;
        options.headers = options.headers
          ? {
              ...options.headers,
              enctype: "multipart/form-data",
            }
          : {
              enctype: "multipart/form-data",
            };
        const url = `${apiUrl}/image-content/insert?image_id=${imageId}`;
        setQueryStatus({ response: undefined });
        fetch(url, options)
          .then((response) => {
            response
              .json()
              .then(
                (obj: ApiServiceResponse<InsertResponse<Row_ImageContent>>) => {
                  const { response, error, errorDetails, errorCode } =
                    obj || {};
                  if (handleExpiredToken) {
                    handleExpiredToken(errorCode);
                  }
                  if (error) {
                    return setQueryStatus({ error, errorCode, errorDetails });
                  }
                  const { result } = response || {};
                  if (result) {
                    return setQueryStatus({ response: { result } });
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
              error: error.toString(),
              errorCode: UnknownErrorCode,
            });
          });
      } else {
        setQueryStatus((previous) =>
          previous.error || previous.response
            ? { response: undefined }
            : previous
        );
      }
    }
  }, [
    apiUrl,
    updateIndicator,
    imageId,
    imageExtension,
    content,
    token,
    handleExpiredToken,
  ]);
  return queryStatus;
};

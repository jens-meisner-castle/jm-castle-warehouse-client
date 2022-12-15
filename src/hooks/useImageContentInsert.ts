import {
  ApiServiceResponse,
  InsertResponse,
  Row_ImageContent,
  TokenExpiredErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useDefaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param imageId equal to the filename
 * @param content the bytes of the image
 * @param updateIndicator change to re-execute (0 => no execution)
 * @returns
 */
export const useImageContentInsert = (
  apiUrl: string,
  imageId: string | undefined,
  imageExtension: string | undefined,
  content: File | undefined,
  updateIndicator: number,
  handleExpiredToken?: () => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<InsertResponse<Row_ImageContent>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const options = useDefaultFetchOptions();

  useEffect(() => {
    if (updateIndicator) {
      if (imageId && imageExtension && content) {
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
                  if (
                    handleExpiredToken &&
                    errorCode === TokenExpiredErrorCode
                  ) {
                    handleExpiredToken();
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
    options,
    handleExpiredToken,
  ]);
  return queryStatus;
};

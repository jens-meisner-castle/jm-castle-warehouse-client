import {
  InsertResponse,
  Row_ImageContent,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

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
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | InsertResponse<Row_ImageContent>
    | {
        result: undefined;
        error: undefined;
        errorDetails?: Record<string, unknown>;
      }
  >({
    result: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (updateIndicator) {
      if (imageId && imageExtension && content) {
        console.log("use image content insert", updateIndicator, imageId);
        const formData = new FormData();
        formData.append("image_id", imageId);
        formData.append("image_extension", imageExtension);
        formData.append("file", content);
        const options = defaultFetchOptions();
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
        setQueryStatus({ result: undefined, error: undefined });
        fetch(url, options)
          .then((response) => {
            response.json().then((obj) => {
              const { response, error, errorDetails } = obj || {};
              const { result } = response || {};
              setQueryStatus({
                error,
                result,
                errorDetails,
              });
            });
          })
          .catch((error) => {
            console.error(error);
            setQueryStatus((previous) => ({
              error: error.toString(),
              result: previous.result,
            }));
          });
      } else {
        setQueryStatus((previous) =>
          previous.error || previous.result
            ? { result: undefined, error: undefined }
            : previous
        );
      }
    }
  }, [apiUrl, updateIndicator, imageId, imageExtension, content]);
  return queryStatus;
};

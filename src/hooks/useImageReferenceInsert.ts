import {
  InsertResponse,
  Row_ImageReference,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export const useImageReferenceInsert = (
  apiUrl: string,
  imageRef: Row_ImageReference | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | InsertResponse<Row_ImageReference>
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
      if (imageRef) {
        console.log("use image ref insert", updateIndicator, imageRef);
        const options = defaultFetchOptions();
        options.method = "POST";
        options.body = JSON.stringify(imageRef);
        options.headers = options.headers
          ? { ...options.headers, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };
        const url = `${apiUrl}/image-ref/insert?image_id=${imageRef.image_id}`;
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
  }, [apiUrl, updateIndicator, imageRef]);
  return queryStatus;
};

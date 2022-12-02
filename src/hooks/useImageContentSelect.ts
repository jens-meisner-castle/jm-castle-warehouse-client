import { useEffect, useState } from "react";
import { ImageContent } from "../types/RowTypes";
import { defaultFetchOptions } from "./options/Utils";

/**
 *
 * @param apiUrl backend api
 * @param name Filter from (seconds of a date)
 * @param updateIndicator change to re-select (0 => no fetch)
 * @returns
 */
export const useImageContentSelect = (
  apiUrl: string,
  imageId: string | undefined,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<
    | { result: ImageContent; error?: never; errorDetails?: never }
    | {
        result: undefined;
        error: undefined;
        errorDetails?: Record<string, unknown>;
      }
    | {
        result?: never;
        error: string;
        errorDetails?: Record<string, unknown>;
      }
  >({
    result: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (updateIndicator && imageId) {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/image-content/select?image_id=${imageId}`;
      fetch(url, options)
        .then((response) => {
          console.log(response);
          setQueryStatus({
            error: "not yet decoded",
          });
        })
        .catch((error) => {
          console.error(error);
          setQueryStatus((previous) => ({
            error: error.toString(),
            result: previous.result,
          }));
        });
    }
  }, [apiUrl, updateIndicator, imageId]);
  return queryStatus;
};

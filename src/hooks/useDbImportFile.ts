import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

interface ImportResult {
  success: boolean;
}

export const useDbImportFile = (
  apiUrl: string,
  content: File | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<ImportResult> | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    if (updateIndicator) {
      if (content) {
        const options = defaultFetchOptions();
        const formData = new FormData();
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
        const url = `${apiUrl}/import/db/file`;
        setQueryStatus({ response: undefined });
        fetch(url, options)
          .then((response) => {
            response.json().then((obj: ApiServiceResponse<ImportResult>) => {
              const { response, error, errorDetails, errorCode } = obj || {};
              if (handleExpiredToken) {
                handleExpiredToken(errorCode);
              }
              if (error) {
                return setQueryStatus({ error, errorCode, errorDetails });
              }
              const { success } = response || {};
              if (success) {
                return setQueryStatus({ response: { success } });
              }
              return setQueryStatus({
                errorCode: UnknownErrorCode,
                error: `Received no error and undefined result.`,
              });
            });
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
  }, [apiUrl, updateIndicator, content, handleExpiredToken]);
  return queryStatus;
};

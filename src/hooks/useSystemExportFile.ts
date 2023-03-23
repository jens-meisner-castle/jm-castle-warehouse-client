import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useSystemExportFile = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<{ blob: Blob; filename: string | undefined }>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    setQueryStatus({ response: undefined });
    if (updateIndicator) {
      const options = defaultFetchOptions(token);
      options.headers = options.headers
        ? { ...options.headers, responseType: "blob" }
        : { responseType: "blob" };
      const url = `${apiUrl}/export/system/file`;
      fetch(url, options)
        .then((response) => {
          response
            .blob()
            .then((blob) => {
              const header = response.headers.get("Content-Disposition");
              const parts = header && header.split(";");
              let filename = Array.isArray(parts)
                ? parts[1].split("=")[1]
                : undefined;
              filename = filename && filename.replaceAll('"', "");
              filename = filename && filename.replaceAll("\\", "");
              return setQueryStatus({
                response: { blob, filename },
              });
            })
            .catch((error) => {
              setQueryStatus({
                errorCode: UnknownErrorCode,
                error: error.toString(),
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
  }, [apiUrl, updateIndicator, token, handleExpiredToken]);
  return queryStatus;
};

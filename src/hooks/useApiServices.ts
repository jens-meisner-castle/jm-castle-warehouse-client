import {
  ApiServiceResponse,
  ErrorCode,
  SerializableService,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export const useApiServices = (
  apiUrl: string,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<{ services: SerializableService[] } | undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    const options = defaultFetchOptions();
    const url = `${apiUrl}/`;
    fetch(url, options)
      .then((response) => {
        response
          .json()
          .then(
            (obj: ApiServiceResponse<{ services: SerializableService[] }>) => {
              const { error, response, errorCode, errorDetails } = obj || {};
              if (handleExpiredToken) {
                handleExpiredToken(errorCode);
              }
              if (error) {
                return setQueryStatus({ error, errorCode, errorDetails });
              }
              if (!response) {
                return setQueryStatus({
                  errorCode: UnknownErrorCode,
                  error: "Received no error and undefined result.",
                });
              }
              setQueryStatus({ response });
            }
          );
      })
      .catch((error) => {
        setQueryStatus({
          error: error.toString(),
          errorCode: UnknownErrorCode,
        });
      });
  }, [apiUrl, handleExpiredToken]);
  return queryStatus;
};

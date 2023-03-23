import {
  ApiServiceResponse,
  ErrorCode,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { SerializableService } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
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
  const token = useAuthorizationToken();

  useEffect(() => {
    const options = defaultFetchOptions(token);
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
  }, [apiUrl, token, handleExpiredToken]);
  return queryStatus;
};

import { ApiServiceResponse, UnknownErrorCode } from "jm-castle-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export const useServiceWorkerExists = (updateIndicator: number) => {
  const [queryStatus, setQueryStatus] = useState<
    ApiServiceResponse<{ exists: boolean }> | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  useEffect(() => {
    setQueryStatus({ response: undefined, error: undefined });

    if (updateIndicator) {
      const options = defaultFetchOptions();
      const url = `/service-worker/exists`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((obj: ApiServiceResponse<{ exists: boolean }>) => {
              const { response, error, errorDetails, errorCode } = obj || {};
              if (error) {
                return setQueryStatus({ error, errorCode, errorDetails });
              }
              if (response) {
                return setQueryStatus({
                  response,
                });
              }
              return setQueryStatus({
                errorCode: UnknownErrorCode,
                error: `Received no error and undefined result.`,
              });
            })
            .catch(() => {
              // no json means no service-worker
              return setQueryStatus({ response: { exists: false } });
            });
        })
        .catch((error) => {
          setQueryStatus({
            errorCode: UnknownErrorCode,
            error: error.toString(),
          });
        });
    }
  }, [updateIndicator]);
  return queryStatus;
};

import { SystemStatus } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export interface SystemStatusQueryStatus {
  status: SystemStatus | undefined;
  error: string | undefined;
}
export const useSystemStatus = (apiUrl: string, updateIndicator: number) => {
  const [queryStatus, setQueryStatus] = useState<SystemStatusQueryStatus>({
    status: undefined,
    error: undefined,
  });
  useEffect(() => {
    if (updateIndicator > 0) {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/system/status`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj) => {
            const { error, response } = obj || {};
            const { status } = response || {};
            setQueryStatus({
              error,
              status,
            });
          });
        })
        .catch((error) => {
          console.error(error);
          setQueryStatus((previous) => ({
            error: error.toString(),
            status: previous.status,
          }));
        });
    }
  }, [apiUrl, updateIndicator]);
  return queryStatus;
};

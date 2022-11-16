import { useEffect, useState } from "react";
import { SystemSetupStatus } from "jm-castle-warehouse-types/build";
import { defaultFetchOptions } from "./options/Utils";

export interface SystemSetupStatusQueryStatus {
  status: SystemSetupStatus | undefined;
  error: string | undefined;
}
export const useSystemSetupStatus = (
  apiUrl: string,
  updateIndicator: number
) => {
  const [queryStatus, setQueryStatus] = useState<SystemSetupStatusQueryStatus>({
    status: undefined,
    error: undefined,
  });
  useEffect(() => {
    const options = defaultFetchOptions();
    const url = `${apiUrl}/system/setup-status`;
    fetch(url, options)
      .then((response) => {
        response.json().then((obj) => {
          const { response, error } = obj;
          const { status } = response || {};
          setQueryStatus({
            error,
            status,
          });
        });
      })
      .catch((error: Error) => {
        console.error(error);
        setQueryStatus((previous) => ({
          error: error.toString(),
          status: previous.status,
        }));
      });
  }, [apiUrl, updateIndicator]);
  return queryStatus;
};

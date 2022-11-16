import { useEffect, useState } from "react";
import { SystemControlResponse } from "jm-castle-warehouse-types/build";
import { defaultFetchOptions } from "./options/Utils";

export interface SystemControlsQueryStatus {
  action: ControlAction;
  response: SystemControlResponse | undefined;
  error: string | undefined;
}
export type ControlAction = "restart" | "none";

export const useSystemControls = (apiUrl: string, action: ControlAction) => {
  const [queryStatus, setQueryStatus] = useState<SystemControlsQueryStatus>({
    action: "none",
    response: undefined,
    error: undefined,
  });
  useEffect(() => {
    setQueryStatus({ action, response: undefined, error: undefined });
    if (action === "restart") {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/system/control/${action}`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj) => {
            const { response, error } = obj;
            setQueryStatus({ action, error, response });
          });
        })
        .catch((error: Error) => {
          console.error(error);
          setQueryStatus({
            action,
            error: error.toString(),
            response: undefined,
          });
        });
    }
  }, [apiUrl, action]);
  return queryStatus;
};

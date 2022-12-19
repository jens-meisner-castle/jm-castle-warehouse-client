import { ExecuteSetupResponse } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultFetchOptions } from "./options/Utils";

export interface ExecuteSystemSetupQueryStatus {
  setup: ExecuteSetupResponse["setup"] | undefined;
  error: string | undefined;
}
export type ExecuteState = "not started" | "start";

export const useExecuteSystemSetup = (apiUrl: string, state: ExecuteState) => {
  const [queryStatus, setQueryStatus] = useState<ExecuteSystemSetupQueryStatus>(
    {
      setup: undefined,
      error: undefined,
    }
  );

  useEffect(() => {
    if (state === "start") {
      const options = defaultFetchOptions();
      const url = `${apiUrl}/system/setup`;
      fetch(url, options)
        .then((response) => {
          response.json().then((obj) => {
            const { response, error } = obj || {};
            const { setup } = response || {};
            setQueryStatus({
              error,
              setup,
            });
          });
        })
        .catch((error: Error) => {
          console.error(error);
          setQueryStatus((previous) => ({
            error: error.toString(),
            setup: previous.setup,
          }));
        });
    }
  }, [apiUrl, state]);
  return queryStatus;
};

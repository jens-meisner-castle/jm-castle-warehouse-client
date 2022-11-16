import { useEffect, useState } from "react";
import { SerializableService } from "jm-castle-warehouse-types/build";
import { defaultFetchOptions } from "./options/Utils";

export interface ApiServicesQueryStatus {
  apiServices: SerializableService[] | undefined;
  error: string | undefined;
}
export const useApiServices = (apiUrl: string) => {
  const [queryStatus, setQueryStatus] = useState<ApiServicesQueryStatus>({
    apiServices: undefined,
    error: undefined,
  });
  useEffect(() => {
    const options = defaultFetchOptions();
    const url = `${apiUrl}/`;
    fetch(url, options)
      .then((response) => {
        response.json().then((obj) => {
          const { error, response } = obj || {};
          const { services } = response || {};
          setQueryStatus({
            error,
            apiServices: services,
          });
        });
      })
      .catch((error) => {
        console.error(error);
        setQueryStatus((previous) => ({
          error: error.toString(),
          apiServices: previous.apiServices,
        }));
      });
  }, [apiUrl]);
  return queryStatus;
};

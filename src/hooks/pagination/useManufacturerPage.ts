import { useQuery } from "@tanstack/react-query";
import { ApiServiceResponse, SelectResponse } from "jm-castle-types/build";
import { Row_Manufacturer } from "jm-castle-warehouse-types/build";
import { useCallback } from "react";
import { useAuthorizationToken } from "../../auth/AuthorizationProvider";
import { defaultFetchOptions } from "../options/Utils";

export const useManufacturerPage = (
  apiUrl: string,
  page: number,
  pageSize: number,
  updateIndicator: number
) => {
  const token = useAuthorizationToken();

  const url = `${apiUrl}/manufacturer/page/select?page=${page}&page_size=${pageSize}`;

  const queryFn = useCallback(async (): Promise<
    ApiServiceResponse<SelectResponse<Row_Manufacturer>>
  > => {
    const options = defaultFetchOptions(token);
    const response = await fetch(url, options);
    return response.json();
  }, [url, token]);

  return useQuery<ApiServiceResponse<SelectResponse<Row_Manufacturer>>>({
    enabled: updateIndicator > 0,
    queryKey: ["manufacturer", page],
    queryFn,
  });
};

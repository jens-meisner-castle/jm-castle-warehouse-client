import { useQuery } from "@tanstack/react-query";
import { ApiServiceResponse, SelectResponse } from "jm-castle-types/build";
import { Row_Receiver } from "jm-castle-warehouse-types/build";
import { useCallback } from "react";
import { useAuthorizationToken } from "../../auth/AuthorizationProvider";
import { defaultFetchOptions } from "../options/Utils";

export const useReceiverPage = (
  apiUrl: string,
  page: number,
  pageSize: number,
  updateIndicator: number
) => {
  const token = useAuthorizationToken();

  const url = `${apiUrl}/receiver/page/select?page=${page}&page_size=${pageSize}`;

  const queryFn = useCallback(async (): Promise<
    ApiServiceResponse<SelectResponse<Row_Receiver>>
  > => {
    const options = defaultFetchOptions(token);
    const response = await fetch(url, options);
    return response.json();
  }, [url, token]);

  return useQuery<ApiServiceResponse<SelectResponse<Row_Receiver>>>({
    enabled: updateIndicator > 0,
    queryKey: ["receiver", page],
    queryFn,
  });
};

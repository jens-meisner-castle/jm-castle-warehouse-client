import {
  ApiServiceResponse,
  ErrorCode,
  FindResponse,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useTablesCount = (
  apiUrl: string,
  tables: string[] | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<
        FindResponse<{
          table: string;
          countOfRows: number;
          lastChangeAt: number | undefined;
        }>[]
      >
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (updateIndicator && tables) {
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/system/stats/count?${tables
        .map((table) => `table=${table}`)
        .join("&")}`;
      fetch(url, options)
        .then((response) => {
          response.json().then(
            (
              obj: ApiServiceResponse<
                FindResponse<{
                  table: string;
                  countOfRows: number;
                  lastChangeAt: number | undefined;
                }>[]
              >
            ) => {
              const { response, error, errorDetails, errorCode } = obj || {};
              if (handleExpiredToken) {
                handleExpiredToken(errorCode);
              }
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
            }
          );
        })
        .catch((error) => {
          setQueryStatus({
            errorCode: UnknownErrorCode,
            error: error.toString(),
          });
        });
    }
  }, [apiUrl, updateIndicator, tables, token, handleExpiredToken]);
  return queryStatus;
};

import {
  ApiServiceResponse,
  ErrorCode,
  Row_Costunit,
  SelectResponse,
  UnknownErrorCode,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../../auth/AuthorizationProvider";
import { defaultFetchOptions, defaultPageSize } from "../options/Utils";
import { useTablesCount } from "../useTablesCount";

const tables = ["costunit"];

export const useCostunitSelect = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<{
        totalCount: number | undefined;
        pages: SelectResponse<Row_Costunit>[];
        finished: boolean;
      }>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  const [currentPage, setCurrentPage] = useState(-1);

  const token = useAuthorizationToken();

  const countApiResponse = useTablesCount(
    apiUrl,
    tables,
    updateIndicator,
    handleExpiredToken
  );

  useEffect(() => {
    const { response } = countApiResponse;
    const costunitResponse = response?.length ? response[0] : undefined;
    const { result } = costunitResponse || {};
    const { row } = result || {};
    const { countOfRows } = row || {};
    if (typeof countOfRows === "number") {
      setQueryStatus({
        response: { totalCount: countOfRows, pages: [], finished: false },
      });
      setCurrentPage(0);
    }
  }, [countApiResponse]);

  const totalCount = queryStatus.response?.totalCount;

  const pageSize = defaultPageSize;

  useEffect(() => {
    if (currentPage >= 0 && typeof totalCount === "number") {
      const maxPage = Math.ceil(totalCount / pageSize) - 1;
      const options = defaultFetchOptions(token);
      const url = `${apiUrl}/costunit/page/select?page=${currentPage}&page_size=${pageSize}`;
      fetch(url, options)
        .then((response) => {
          response
            .json()
            .then((obj: ApiServiceResponse<SelectResponse<Row_Costunit>>) => {
              const { response, error, errorDetails, errorCode } = obj || {};
              if (handleExpiredToken) {
                handleExpiredToken(errorCode);
              }
              if (error) {
                return setQueryStatus({ error, errorCode, errorDetails });
              }
              if (response) {
                setQueryStatus((previous) => {
                  const newPages = previous.response?.pages
                    ? [...previous.response.pages, response]
                    : [response];
                  return {
                    response: {
                      totalCount: previous.response?.totalCount,
                      pages: newPages,
                      finished: currentPage === maxPage,
                    },
                  };
                });
                return setCurrentPage((previous) =>
                  previous < maxPage ? previous + 1 : previous
                );
              }
              return setQueryStatus({
                errorCode: UnknownErrorCode,
                error: `Received no error and undefined result.`,
              });
            });
        })
        .catch((error) => {
          setQueryStatus({
            errorCode: UnknownErrorCode,
            error: error.toString(),
          });
        });
    }
  }, [apiUrl, currentPage, pageSize, totalCount, token, handleExpiredToken]);

  return queryStatus;
};

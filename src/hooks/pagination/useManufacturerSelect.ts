import {
  ApiServiceResponse,
  ErrorCode,
  SelectResponse,
  UnknownErrorCode,
} from "jm-castle-types/build";
import { Row_Manufacturer } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { defaultPageSize } from "../options/Utils";
import { useTablesCount } from "../useTablesCount";
import { useManufacturerPage } from "./useManufacturerPage";

const tables = ["manufacturer"];

export const useManufacturerSelect = (
  apiUrl: string,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<{
        totalCount: number | undefined;
        pages: SelectResponse<Row_Manufacturer>[];
        finished: boolean;
      }>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });

  const [currentPage, setCurrentPage] = useState(-1);

  useEffect(() => {
    if (updateIndicator > 0) {
      setQueryStatus((previous) => ({
        response: {
          totalCount: undefined,
          pages: previous.response?.pages || [],
          finished: false,
        },
      }));
    }
  }, [updateIndicator]);

  const countApiResponse = useTablesCount(
    apiUrl,
    tables,
    updateIndicator,
    handleExpiredToken
  );

  useEffect(() => {
    const { response } = countApiResponse;
    const manufacturerResponse = response?.length ? response[0] : undefined;
    const { result } = manufacturerResponse || {};
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

  const { data, isLoading } = useManufacturerPage(
    apiUrl,
    currentPage,
    pageSize,
    currentPage >= 0 ? updateIndicator : 0
  );

  useEffect(() => {
    if (currentPage >= 0 && typeof totalCount === "number" && !isLoading) {
      const maxPage = Math.ceil(totalCount / pageSize) - 1;
      const { response, error, errorDetails, errorCode } = data || {};
      if (handleExpiredToken) {
        handleExpiredToken(errorCode);
      }
      if (error) {
        return setQueryStatus({ error, errorCode, errorDetails });
      }
      if (response) {
        setQueryStatus((previous) => {
          const previousPages = previous.response?.pages || [];
          const newPages =
            previousPages.length > currentPage
              ? [...previousPages.slice(0, currentPage), response]
              : [...previousPages, response];
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
    }
  }, [
    apiUrl,
    currentPage,
    pageSize,
    totalCount,
    data,
    isLoading,
    handleExpiredToken,
  ]);

  return queryStatus;
};

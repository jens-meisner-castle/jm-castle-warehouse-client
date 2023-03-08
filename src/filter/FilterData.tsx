import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useMemo, useState } from "react";
import { ErrorData } from "../components/ErrorDisplays";
import { useMasterdata } from "../hooks/pagination/useMasterdata";
import {
  HashtagRow,
  ManufacturerRow,
  StoreRow,
  StoreSectionRow,
} from "../types/RowTypes";
import { FilterAspect } from "./Types";

export interface FilterData {
  errors: Record<string, ErrorData>;
  rows: {
    storeRows?: StoreRow[];
    hashtagRows?: HashtagRow[];
    sectionRows?: StoreSectionRow[];
    manufacturerRows?: ManufacturerRow[];
  };
}
export const useFilterData = (
  apiUrl: string,
  aspects: FilterAspect[],
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void
) => {
  const [filterData, setFilterData] = useState<FilterData>({
    errors: {},
    rows: {},
  });

  const what = useMemo(
    () => ({
      section:
        aspects.includes("storeSection") || aspects.includes("storeSection"),
      store: aspects.includes("store"),
      hashtag: aspects.includes("hashtags"),
      manufacturer: aspects.includes("manufacturer"),
    }),
    [aspects]
  );

  const { rows, errors } = useMasterdata(apiUrl, what, 1, handleExpiredToken);

  const { sectionRows, storeRows, hashtagRows, manufacturerRows } = rows || {};

  useEffect(() => {
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, storeRows },
    }));
  }, [storeRows]);

  useEffect(() => {
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, sectionRows },
    }));
  }, [sectionRows]);

  useEffect(() => {
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, hashtagRows },
    }));
  }, [hashtagRows]);

  useEffect(() => {
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, manufacturerRows },
    }));
  }, [manufacturerRows]);

  useEffect(() => {
    setFilterData((previous) => ({
      errors,
      rows: previous.rows,
    }));
  }, [errors]);

  return filterData;
};

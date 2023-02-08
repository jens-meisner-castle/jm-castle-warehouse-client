import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { ErrorData } from "../components/ErrorDisplays";
import { useHashtagSelect } from "../hooks/useHashtagSelect";
import { useStoreSectionSelect } from "../hooks/useStoreSectionSelect";
import { useStoreSelect } from "../hooks/useStoreSelect";
import {
  fromRawHashtag,
  fromRawStore,
  fromRawStoreSection,
  HashtagRow,
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

  const storeApiResponse = useStoreSelect(
    apiUrl,
    "%",
    aspects.includes("store") ? 1 : 0,
    handleExpiredToken
  );
  const { response: storeResponse } = storeApiResponse;
  const { result: storeResult } = storeResponse || {};
  const { rows: storeRows } = storeResult || {};

  const sectionApiResponse = useStoreSectionSelect(
    apiUrl,
    "%",
    aspects.includes("storeSection") || aspects.includes("storeSections")
      ? 1
      : 0,
    handleExpiredToken
  );
  const { response: sectionResponse } = sectionApiResponse;
  const { result: sectionResult } = sectionResponse || {};
  const { rows: sectionRows } = sectionResult || {};

  const hashtagApiResponse = useHashtagSelect(
    apiUrl,
    "%",
    aspects.includes("hashtags") ? 1 : 0,
    handleExpiredToken
  );
  const { response: hashtagResponse } = hashtagApiResponse;
  const { result: hashtagResult } = hashtagResponse || {};
  const { rows: hashtagRows } = hashtagResult || {};

  useEffect(() => {
    const newRows = storeRows?.map((r) => fromRawStore(r));
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, storeRows: newRows },
    }));
  }, [storeRows]);

  useEffect(() => {
    storeApiResponse.error &&
      setFilterData((previous) => ({
        errors: { ...previous.errors, store: storeApiResponse },
        rows: previous.rows,
      }));
  }, [storeApiResponse]);

  useEffect(() => {
    const newRows = sectionRows?.map((r) => fromRawStoreSection(r));
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, sectionRows: newRows },
    }));
  }, [sectionRows]);

  useEffect(() => {
    sectionApiResponse.error &&
      setFilterData((previous) => ({
        errors: { ...previous.errors, section: sectionApiResponse },
        rows: previous.rows,
      }));
  }, [sectionApiResponse]);

  useEffect(() => {
    const newRows = hashtagRows?.map((r) => fromRawHashtag(r));
    setFilterData((previous) => ({
      errors: previous.errors,
      rows: { ...previous.rows, hashtagRows: newRows },
    }));
  }, [hashtagRows]);

  useEffect(() => {
    hashtagApiResponse.error &&
      setFilterData((previous) => ({
        errors: { ...previous.errors, hashtag: hashtagApiResponse },
        rows: previous.rows,
      }));
  }, [hashtagApiResponse]);

  return filterData;
};

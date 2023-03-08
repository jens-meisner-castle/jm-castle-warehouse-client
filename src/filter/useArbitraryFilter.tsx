import { useCallback, useEffect, useState } from "react";
import { AllowedKeys } from "../types/Types";
import { ArbitraryFilter, FilterAspect } from "./Types";

export type FilterTest<T> = Partial<{
  nameFragment: AllowedKeys<T, string>[];
  hashtags: AllowedKeys<T, string[] | undefined>[];
  storeSection: AllowedKeys<T, string>[];
  storeSections: AllowedKeys<T, string>[];
  store: AllowedKeys<T, string>[];
  manufacturer: AllowedKeys<T, string>[];
}>;

const pass = <T,>(
  row: T,
  test: FilterTest<T>,
  aspect: FilterAspect,
  filter: ArbitraryFilter
): boolean => {
  switch (aspect) {
    case "nameFragment": {
      const { nameFragment } = filter;
      const nameRegex = nameFragment?.length
        ? new RegExp(nameFragment, "i")
        : undefined;
      const keys = test.nameFragment;
      if (nameRegex && keys) {
        return !!keys.find((k) => {
          const rowValue = row[k] as string | undefined | null;
          const matchResult = rowValue ? rowValue.match(nameRegex) : undefined;
          return matchResult ? matchResult.length > 0 : false;
        });
      }
      return true;
    }
    case "hashtags": {
      const { hashtags } = filter;
      const keys = test.hashtags;
      if (hashtags && keys) {
        return keys.every((k) => {
          const rowValue = row[k] as string[] | undefined | null;
          return rowValue
            ? hashtags.every((hashtag) => rowValue.includes(hashtag))
            : false;
        });
      }
      return true;
    }
    case "storeSections": {
      const { storeSections } = filter;
      const keys = test.storeSections;
      if (storeSections && keys) {
        return keys.every((k) => {
          const rowValue = row[k] as string | undefined | null;
          return rowValue ? storeSections.includes(rowValue) : false;
        });
      }
      return true;
    }
    case "storeSection": {
      const { storeSection } = filter;
      const keys = test.storeSection;
      if (storeSection && keys) {
        return keys.every((k) => {
          const rowValue = row[k] as string | undefined | null;
          return rowValue ? storeSection === rowValue : false;
        });
      }
      return true;
    }
    case "store": {
      const { store } = filter;
      const keys = test.store;
      if (store && keys) {
        return keys.every((k) => {
          const rowValue = row[k] as string | undefined | null;
          return rowValue ? store === rowValue : false;
        });
      }
      return true;
    }
    case "manufacturer": {
      const { manufacturer } = filter;
      const keys = test.manufacturer;
      if (manufacturer && keys) {
        return keys.every((k) => {
          const rowValue = row[k] as string | undefined | null;
          return rowValue ? manufacturer === rowValue : false;
        });
      }
      return true;
    }
    default:
      return true;
  }
};

export const useArbitraryFilter = <T,>(
  initialFilter: ArbitraryFilter,
  test: FilterTest<T>
) => {
  const [filter, setFilter] = useState(initialFilter);

  const handleFilterChange = useCallback(
    (changes: Partial<ArbitraryFilter>) => {
      setFilter((previous) => {
        const newFilter = { ...previous, ...changes };
        return Object.keys(newFilter).find(
          (k) => newFilter[k as keyof typeof newFilter]
        )
          ? newFilter
          : {};
      });
    },
    []
  );

  const passFilter = useCallback(
    (row: T) =>
      Object.keys(test).every((k) => {
        const filterAspect = k as FilterAspect;
        const fieldNames = test[filterAspect];
        return !fieldNames || pass(row, test, filterAspect, filter);
      }),
    [filter, test]
  );

  const [hookState, setHookState] = useState({
    filter,
    handleFilterChange,
    passFilter,
  });

  useEffect(() => {
    setHookState({ filter, handleFilterChange, passFilter });
  }, [filter, handleFilterChange, passFilter]);

  return hookState;
};

import { useCallback, useEffect, useState } from "react";
import { TimeintervalFilter } from "./Types";

export const useTimeintervalFilter = (initialFilter: TimeintervalFilter) => {
  const [filter, setFilter] = useState(initialFilter);

  const handleFilterChange = useCallback(
    (changes: Partial<TimeintervalFilter>) => {
      setFilter((previous) => ({
        ...previous,
        ...changes,
      }));
    },
    []
  );

  const [hookState, setHookState] = useState({
    timeFilter: filter,
    handleTimeFilterChange: handleFilterChange,
  });

  useEffect(
    () =>
      setHookState({
        timeFilter: filter,
        handleTimeFilterChange: handleFilterChange,
      }),
    [filter, handleFilterChange]
  );
  return hookState;
};

import { Typography } from "@mui/material";

export interface FilteredRowsDisplayProps<T, F> {
  all: T[] | (T[] | undefined)[] | undefined;
  filtered: F[] | undefined;
}

export const FilteredRowsDisplay = <T, F>(
  props: FilteredRowsDisplayProps<T, F>
) => {
  const { all, filtered } = props;

  const totalRowsCount = all
    ? Array.isArray(all[0])
      ? (all as (T[] | undefined)[]).reduce(
          (sum, arr) => (arr ? arr.length : 0) + sum,
          0
        )
      : all.length
    : 0;

  const display =
    totalRowsCount && filtered && totalRowsCount !== filtered.length
      ? `${filtered.length} Datenzeilen von ${totalRowsCount} gefiltert`
      : undefined;

  return display ? <Typography>{display}</Typography> : <></>;
};

import { AllowedKeys } from "../types/Types";

export type NonEmptyArray<T> = [T] & T[];

export const isNonEmptyArray = <T>(v: T[]): v is NonEmptyArray<T> => {
  return Array.isArray(v) && !!v.length;
};

export type CompareFunction<T> = (a: T, b: T) => number;

export const concatCompares = <T>(
  compares: NonEmptyArray<CompareFunction<T>>
): CompareFunction<T> => {
  return compares.length < 2
    ? compares[0]
    : (a: T, b: T) => {
        let result = 0;
        compares.find((fn) => {
          result = fn(a, b);
          return result !== 0;
        });
        return result;
      };
};

export const compareString = <T>(
  field: AllowedKeys<T, string>,
  direction: "ascending" | "descending"
): CompareFunction<T> => {
  const factor = direction === "ascending" ? 1 : -1;
  return (a: T, b: T) => {
    return (
      (a[field]
        ? b[field]
          ? (a[field] as string).localeCompare(b[field] as string)
          : -1
        : b[field]
        ? 1
        : 0) * factor
    );
  };
};

export const compareNumber = <T>(
  field: AllowedKeys<T, number>,
  direction: "ascending" | "descending"
): CompareFunction<T> => {
  const factor = direction === "ascending" ? 1 : -1;
  return (a: T, b: T) => {
    return (
      (typeof a[field] === "number"
        ? typeof b[field] === "number"
          ? (a[field] as number) - (b[field] as number)
          : -1
        : typeof b[field] === "number"
        ? 1
        : 0) * factor
    );
  };
};

export const compareDate = <T>(
  field: AllowedKeys<T, Date>,
  direction: "ascending" | "descending"
): CompareFunction<T> => {
  const factor = direction === "ascending" ? 1 : -1;
  return (a: T, b: T) => {
    return (
      (typeof a[field] === "object"
        ? typeof b[field] === "object"
          ? (a[field] as Date).getTime() - (b[field] as Date).getTime()
          : -1
        : typeof b[field] === "object"
        ? 1
        : 0) * factor
    );
  };
};

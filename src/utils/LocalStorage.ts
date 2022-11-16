import { DateTime } from "luxon";
import { TimeintervalFilter } from "../filter/Types";
import { PageOptions } from "../pages/Types";
import { getDateFormat } from "./Format";

export const storeFilterForPage = (
  filter: Partial<TimeintervalFilter>,
  page: string
) => {
  const { from, to } = filter;
  const key = `${page}.filter`;
  const value = JSON.stringify({
    from: from ? from.toMillis() : undefined,
    fromDisplay: from ? from.toFormat(getDateFormat("second")) : undefined,
    to: to ? to.toMillis() : undefined,
    toDisplay: to ? to.toFormat(getDateFormat("second")) : undefined,
  });
  window.localStorage.setItem(key, value);
};

export const loadFilterForPage = (
  page: string
): TimeintervalFilter | undefined => {
  const key = `${page}.filter`;
  const value = window.localStorage.getItem(key);
  if (!value) {
    return undefined;
  }
  try {
    const obj = value ? JSON.parse(value) : undefined;
    const { from, to } = obj;
    return {
      from: from ? DateTime.fromMillis(from) : DateTime.now(),
      to: to ? DateTime.fromMillis(to) : DateTime.now(),
    };
  } catch (error) {
    return undefined;
  }
};

export const storeOptionsForPage = (options: PageOptions, page: string) => {
  const key = `${page}.options`;
  const value = JSON.stringify(options);
  window.localStorage.setItem(key, value);
};

export const loadOptionsForPage = (page: string): PageOptions | undefined => {
  const key = `${page}.options`;
  const value = window.localStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : undefined;
  } catch (error) {
    return undefined;
  }
};

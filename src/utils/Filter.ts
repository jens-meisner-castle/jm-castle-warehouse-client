import { DateTime } from "luxon";
import { TimeintervalFilter } from "../filter/Types";

export const initialFrom = () => DateTime.now().minus({ hours: 1 });
export const initialTo = () => DateTime.now().plus({ minutes: 15 });

export const getNewFilter = (
  previous?: TimeintervalFilter,
  newFrom?: DateTime,
  newTo?: DateTime
): TimeintervalFilter => {
  const { from: previousFrom, to: previousTo } = previous || {};
  const from = newFrom || previousFrom || initialFrom();
  const to = newTo || previousTo || initialTo();
  if (to.diff(from).milliseconds > 0) {
    // fine
    return { from, to };
  } else {
    return newFrom
      ? {
          from,
          to: from,
        }
      : { from: to, to };
  }
};

export const getSecondsInterval_logged_at = (from: DateTime, to: DateTime) => {
  return {
    logged_at_from: Math.floor(from.toMillis() / 1000),
    logged_at_to: Math.floor(to.toMillis() / 1000),
  };
};

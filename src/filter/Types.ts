import { DateTime } from "luxon";

export type FilterAspect =
  | "hashtags"
  | "nameFragment"
  | "store"
  | "storeSection"
  | "storeSections";

export interface TimeintervalFilter {
  from: DateTime;
  to: DateTime;
}

export interface ArbitraryFilter {
  hashtags?: string[];
  nameFragment?: string;
  store?: string;
  storeSection?: string;
  storeSections?: string[];
}

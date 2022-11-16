import { DateTime } from "luxon";

export interface TimeintervalFilter {
  from: DateTime;
  to: DateTime;
}

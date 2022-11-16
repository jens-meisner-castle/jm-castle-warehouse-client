import { AnyDataValue, LuxonKey } from "jm-castle-warehouse-types/build";
import { DateTime } from "luxon";
import {
  DateFormatOptions,
  FormatterFactory,
  NumberFormatOptions,
} from "./Types";

export const getDateFormat = (level: LuxonKey): string => {
  switch (level) {
    case "millisecond":
      return "HH:mm:ss.SSS";
    case "second":
      return "yyyy-LL-dd HH:mm:ss";
    case "minute":
      return "yyyy-LL-dd HH:mm";
    case "hour":
      return "yyyy-LL-dd HH";
    case "day":
      return "yyyy-LL-dd";
    default:
      return "yyyy-LL-dd HH:mm:ss";
  }
};

export const getDateFormatWithoutYear = (level: LuxonKey): string => {
  switch (level) {
    case "millisecond":
      return "HH:mm:ss.SSS";
    case "second":
      return "LL-dd HH:mm:ss";
    case "minute":
      return "LL-dd HH:mm";
    case "hour":
      return "LL-dd HH";
    case "day":
      return "LL-dd";
    default:
      return "LL-dd HH:mm:ss";
  }
};

export const getDateLevelFormat = (level: LuxonKey): string => {
  switch (level) {
    case "millisecond":
      return ".SSS";
    case "second":
      return ":ss";
    case "minute":
      return ":mm";
    case "hour":
      return " HH";
    case "day":
      return "-DD";
  }
};

export const getNumberFormatter = (options: NumberFormatOptions) => {
  const fractionDigits =
    typeof options.decimals === "number" ? options.decimals : 1;
  return (n: AnyDataValue) => {
    return typeof n === "number"
      ? n.toLocaleString("de-DE", { maximumFractionDigits: fractionDigits })
      : n
      ? n.toString()
      : "";
  };
};

export const getDateFormatter = (options: DateFormatOptions) => {
  const { format, level } = options;
  const usedFormat =
    typeof format === "string" ? format : getDateFormat(level || "second");
  return (d: AnyDataValue) => {
    return typeof d === "object"
      ? DateTime.fromJSDate(d as Date).toFormat(usedFormat)
      : d
      ? d.toString()
      : "";
  };
};

export const formatterFactory: FormatterFactory = {
  getNumberFormatter,
  getDateFormatter: (options: DateFormatOptions) => (d: AnyDataValue) => {
    const { format, level } = options;
    const usedFormat =
      format || (level ? getDateLevelFormat(level) : "yyyy-LL-dd HH:mm:ss");
    return typeof d === "object"
      ? DateTime.fromJSDate(d as Date).toFormat(usedFormat)
      : d
      ? d.toString()
      : "";
  },
};

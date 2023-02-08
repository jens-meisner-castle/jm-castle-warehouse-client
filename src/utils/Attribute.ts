import { AttributeValue } from "jm-castle-warehouse-types/build";
import { DateTime } from "luxon";
import { AttributeRow, AttributeValues } from "../types/RowTypes";

const formatAttributeValueDate = (v: Date) =>
  DateTime.fromJSDate(v).toFormat("yyyy-LL-dd HH:mm:ss");

export const toDisplayValue = (v: AttributeValue, row: AttributeRow) => {
  switch (row.valueType) {
    case "string":
      return typeof v === "string" ? v : "";
    case "number":
      return typeof v === "number" ? v.toString().replace(".", ",") : "";
    case "boolean":
      return typeof v === "boolean"
        ? v.toString()
        : typeof v === "string"
        ? v === "true" || v === "false"
          ? v
          : ""
        : "";
    case "date":
      return typeof v === "number"
        ? formatAttributeValueDate(new Date(v))
        : typeof v === "string"
        ? v
        : "";
    default:
      return "";
  }
};

export const fromDisplayValue = (v: string, row: AttributeRow) => {
  try {
    switch (row.valueType) {
      case "string":
        return v;
      case "number": {
        const parsed = parseFloat(v.replace(",", "."));
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      case "boolean":
        return v === "true" ? true : v === "false" ? false : undefined;
      case "date":
        return DateTime.fromFormat(v, "yyyy-LL-dd HH:mm:ss").toFormat(
          "yyyy-LL-dd HH:mm:ss"
        );
      default:
        return "";
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const displayValueForValues = (
  values: AttributeValues,
  maxCount: number,
  attributes: Record<string, AttributeRow>
) => {
  const keys = Object.keys(values);
  const used = keys
    .sort((a, b) => a.localeCompare(b))
    .slice(0, Math.min(maxCount, keys.length));
  return used
    .map((k) => {
      const attribute = attributes[k];
      return attribute
        ? `${k}: ${toDisplayValue(values[k], attribute)} ${
            attribute.valueUnit || ""
          }`
        : `${k}: unknown attribute`;
    })
    .join("\n");
};

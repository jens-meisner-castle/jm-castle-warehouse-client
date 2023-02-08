import { Variant } from "@mui/material/styles/createTypography";

export type SizeVariant = "tiny" | "small" | "medium" | "large";

export const typoVariantForSize = (size: SizeVariant): Variant => {
  switch (size) {
    case "tiny":
      return "caption";
    case "small":
      return "body2";
    default:
      return "body1";
  }
};

export const buttonSizeForSize = (
  size: SizeVariant
): "large" | "medium" | "small" => {
  switch (size) {
    case "tiny":
      return "small";
    case "small":
      return "small";
    case "medium":
      return "medium";
    default:
      return "large";
  }
};

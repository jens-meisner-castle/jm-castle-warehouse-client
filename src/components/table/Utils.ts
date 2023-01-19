import { SizeVariant } from "../SizeVariant";

export const labelRowsPerPage = (sizeVariant: SizeVariant) =>
  sizeVariant === "tiny"
    ? ""
    : sizeVariant === "small"
    ? "Zeilen"
    : "Zeilen pro Seite";

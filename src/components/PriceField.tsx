import { TextField, TextFieldProps } from "@mui/material";
import { useCallback, useState } from "react";
import { ErrorData } from "./ErrorDisplays";

export type PriceFieldProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  errorData?: ErrorData;
} & Omit<Omit<Omit<TextFieldProps, "value">, "onChange">, "type">;

const formatPrice = (n: number | null) =>
  typeof n === "number"
    ? (n / 100).toFixed(2).toString().replace(".", ",")
    : "";

const parsePrice = (s: string) => {
  const n = s ? parseFloat(s.replace(",", ".")) : null;
  return typeof n === "number" ? n * 100 : null;
};

export const PriceField = (props: PriceFieldProps) => {
  const { value, onChange, errorData, helperText, ...textFieldProps } = props;

  const [priceText, setPriceText] = useState(formatPrice(value));

  const handleChangedValue = useCallback(
    (value: string) => {
      setPriceText(value);
      onChange(parsePrice(value));
    },
    [onChange]
  );

  const { error } = errorData || {};

  const usedHelperText = error || helperText || "";

  return (
    <TextField
      {...textFieldProps}
      helperText={usedHelperText}
      value={priceText}
      error={!!error}
      type="text"
      onChange={(event) => handleChangedValue(event.target.value)}
      onBlur={() => setPriceText(formatPrice(value))}
    />
  );
};

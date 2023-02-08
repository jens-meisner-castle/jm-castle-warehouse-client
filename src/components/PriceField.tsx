import { TextField, TextFieldProps } from "@mui/material";
import { useCallback, useState } from "react";
import { formatPrice, parsePrice } from "../utils/Format";
import { ErrorData } from "./ErrorDisplays";

export type PriceFieldProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  errorData?: ErrorData;
} & Omit<Omit<Omit<TextFieldProps, "value">, "onChange">, "type">;

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

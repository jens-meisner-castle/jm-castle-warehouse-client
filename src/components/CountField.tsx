import { TextField, TextFieldProps } from "@mui/material";
import { ErrorData } from "./ErrorDisplays";

export type CountFieldProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  errorData?: ErrorData;
} & Omit<Omit<Omit<TextFieldProps, "value">, "onChange">, "type">;

export const CountField = (props: CountFieldProps) => {
  const { value, onChange, errorData, helperText, ...textFieldProps } = props;

  const { error } = errorData || {};

  const usedHelperText = error || helperText || "";

  return (
    <TextField
      {...textFieldProps}
      value={value}
      helperText={usedHelperText}
      error={!!error}
      type="number"
      onChange={(event) => {
        const count = event.target.value
          ? Number.parseInt(event.target.value)
          : undefined;
        if (typeof count === "number") {
          return onChange(count);
        }
        if (count === undefined) {
          return onChange(null);
        }
      }}
    />
  );
};

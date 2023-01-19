import { TextField, TextFieldProps } from "@mui/material";
import { useMemo } from "react";

export type TextComponentProps = TextFieldProps & {
  value: string | Record<string, unknown>;
  formatObject?: boolean;
};

export const TextComponent = (props: TextComponentProps) => {
  const { value, formatObject, ...textFieldProps } = props;
  const display = useMemo(
    () =>
      typeof value === "string"
        ? value
        : formatObject
        ? JSON.stringify(value, null, 2)
        : JSON.stringify(value),
    [value, formatObject]
  );
  return <TextField value={display} {...textFieldProps} />;
};

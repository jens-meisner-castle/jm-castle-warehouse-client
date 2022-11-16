import { TextareaAutosize, TextareaAutosizeProps } from "@mui/material";
import { useMemo } from "react";

interface AdditionalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: string | Record<string, any>;
  formatObject?: boolean;
}
export type TextareaComponentProps = Omit<TextareaAutosizeProps, "value"> &
  AdditionalProps;

export const TextareaComponent = (props: TextareaComponentProps) => {
  const { value, formatObject, ...textareaProps } = props;
  const display = useMemo(
    () =>
      typeof value === "string"
        ? value
        : formatObject
        ? JSON.stringify(value, null, 2)
        : JSON.stringify(value),
    [value, formatObject]
  );
  return <TextareaAutosize value={display} {...textareaProps} />;
};

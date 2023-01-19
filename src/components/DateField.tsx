import { TextFieldProps } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "react";
import { DateTimeField } from "./DateTimeField";

export type DateFieldProps = {
  value: Date;
  onChange: (value: Date) => void;
  level: "day" | "hour" | "minute";
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const DateField = (props: DateFieldProps) => {
  const { value, onChange, level, ...textFieldProps } = props;

  const convertedValue = useMemo(() => DateTime.fromJSDate(value), [value]);

  const handleChangedConvertedValue = useCallback(
    (value: DateTime | null) =>
      value && value.isValid && onChange(value.toJSDate()),
    [onChange]
  );

  return (
    <DateTimeField
      {...textFieldProps}
      value={convertedValue}
      level={level}
      onChange={handleChangedConvertedValue}
    />
  );
};

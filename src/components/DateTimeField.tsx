import { TextField, TextFieldProps } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { CalendarOrClockPickerView } from "@mui/x-date-pickers/internals/models";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "react";
import { getDateFormat } from "../utils/Format";

export const handleChangeDatePickerIgnored = (value: DateTime | null) =>
  1 > 2 && console.error("never", value);

export type DateTimeFieldProps = {
  value: DateTime;
  onChange: (value: DateTime) => void;
  level: "day" | "hour" | "minute";
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const DateTimeField = (props: DateTimeFieldProps) => {
  const { value, onChange, level, ...textFieldProps } = props;

  const handleChangedValue = useCallback(
    (value: DateTime | null) => value && value.isValid && onChange(value),
    [onChange]
  );

  const inputFormat = useMemo(() => getDateFormat(level), [level]);

  const pickerViews = useMemo<CalendarOrClockPickerView[]>(() => {
    switch (level) {
      case "day":
        return ["day"];
      case "hour":
        return ["day", "hours"];
      default:
        return ["day", "hours", "minutes"];
    }
  }, [level]);

  return (
    <DateTimePicker
      value={value}
      inputFormat={inputFormat}
      ampmInClock={false}
      ampm={false}
      views={pickerViews}
      onChange={handleChangedValue}
      onAccept={handleChangedValue}
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};

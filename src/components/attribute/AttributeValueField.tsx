import { TextField, TextFieldProps } from "@mui/material";
import { AttributeValue } from "jm-castle-warehouse-types/build";
import { useCallback, useState } from "react";
import { AttributeRow } from "../../types/RowTypes";
import { fromDisplayValue, toDisplayValue } from "../../utils/Attribute";
import { ErrorData } from "../ErrorDisplays";

export type AttributeValueFieldProps = {
  attribute: AttributeRow;
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  errorData?: ErrorData;
} & Omit<Omit<Omit<TextFieldProps, "value">, "onChange">, "type">;

export const AttributeValueField = (props: AttributeValueFieldProps) => {
  const {
    attribute,
    value,
    onChange,
    errorData,
    helperText,
    ...textFieldProps
  } = props;

  const [inputValue, setInputValue] = useState(
    toDisplayValue(value, attribute)
  );

  const handleChangedInput = useCallback(
    (s: string) => {
      setInputValue(s);
      const newAttributeValue = fromDisplayValue(s, attribute);
      if (
        typeof newAttributeValue === "string" ||
        typeof newAttributeValue === "number" ||
        typeof newAttributeValue === "boolean"
      ) {
        onChange(newAttributeValue);
      }
    },
    [onChange, attribute]
  );

  const { error } = errorData || {};

  const usedHelperText = error || helperText || "";

  return (
    <TextField
      {...textFieldProps}
      value={inputValue || ""}
      helperText={usedHelperText}
      error={!!error}
      type="text"
      onChange={(event) => handleChangedInput(event.target.value)}
      onBlur={() => setInputValue(toDisplayValue(value, attribute))}
    />
  );
};

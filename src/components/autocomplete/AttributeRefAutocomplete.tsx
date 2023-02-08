import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { AttributeRow } from "../../types/RowTypes";
import { ErrorData } from "../ErrorDisplays";

export type AttributeRefAutocompleteProps = {
  value: AttributeRow | undefined | null;
  onChange: (attribute: AttributeRow | null) => void;
  attributes: AttributeRow[];
  errorData?: ErrorData;
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const AttributeRefAutocomplete = (
  props: AttributeRefAutocompleteProps
) => {
  const {
    attributes,
    value,
    onChange,
    label,
    errorData,
    helperText,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.attributeId);

  const orderedAttributes = useMemo(() => {
    return [...attributes].sort((a, b) =>
      a.attributeId.localeCompare(b.attributeId)
    );
  }, [attributes]);

  const { error } = errorData || {};

  const usedHelperText =
    error && helperText ? `${helperText}. ${error}` : error || helperText || "";

  return (
    <Autocomplete
      disablePortal
      id="attributeRefEditor"
      getOptionLabel={(row) => row.attributeId}
      isOptionEqualToValue={(a, b) => a.attributeId === b.attributeId}
      options={orderedAttributes}
      value={value || null}
      onChange={(event, row) => {
        onChange(row);
      }}
      inputValue={inputValue || ""}
      onInputChange={(event, value) => setInputValue(value)}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...textFieldProps}
          {...params}
          error={!!error}
          helperText={usedHelperText}
          label={label || "Attribut"}
        />
      )}
    />
  );
};

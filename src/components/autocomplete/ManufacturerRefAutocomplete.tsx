import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { ManufacturerRow } from "../../types/RowTypes";
import { ErrorData } from "../ErrorDisplays";

export type ManufacturerRefAutocompleteProps = {
  value: ManufacturerRow | undefined;
  onChange: (manufacturer: ManufacturerRow | null) => void;
  manufacturers: ManufacturerRow[];
  errorData?: ErrorData;
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const ManufacturerRefAutocomplete = (
  props: ManufacturerRefAutocompleteProps
) => {
  const {
    manufacturers,
    value,
    onChange,
    label,
    errorData,
    helperText,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.manufacturerId);

  const orderedManufacturers = useMemo(() => {
    return [...manufacturers].sort((a, b) =>
      a.manufacturerId.localeCompare(b.manufacturerId)
    );
  }, [manufacturers]);

  const { error } = errorData || {};

  const usedHelperText =
    error && helperText ? `${helperText}. ${error}` : error || helperText || "";

  return (
    <Autocomplete
      disablePortal
      id="manufacturerRefEditor"
      getOptionLabel={(row) => row.manufacturerId}
      isOptionEqualToValue={(a, b) => a.manufacturerId === b.manufacturerId}
      options={orderedManufacturers}
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
          label={label || "Hersteller"}
        />
      )}
    />
  );
};

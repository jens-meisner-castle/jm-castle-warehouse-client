import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { StoreRow } from "../../types/RowTypes";
import { ErrorData } from "../ErrorDisplays";

export type StoreRefAutocompleteProps = {
  value: StoreRow | undefined;
  onChange: (store: StoreRow | null) => void;
  errorData?: ErrorData;
  stores: StoreRow[];
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const StoreRefAutocomplete = (props: StoreRefAutocompleteProps) => {
  const {
    stores,
    value,
    onChange,
    label,
    errorData,
    helperText,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.storeId);

  const orderedStores = useMemo(() => {
    return [...stores].sort((a, b) => a.storeId.localeCompare(b.storeId));
  }, [stores]);

  const { error } = errorData || {};

  const usedHelperText = error || helperText || "";

  return (
    <Autocomplete
      disablePortal
      id="storeRefEditor"
      getOptionLabel={(row) => row.storeId}
      options={orderedStores}
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
          label={label || "Lager"}
        />
      )}
    />
  );
};

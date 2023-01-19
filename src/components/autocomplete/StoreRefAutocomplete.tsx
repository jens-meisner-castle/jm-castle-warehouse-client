import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { StoreRow } from "../../types/RowTypes";

export type StoreRefAutocompleteProps = {
  value: StoreRow | undefined;
  onChange: (store: StoreRow | null) => void;
  stores: StoreRow[];
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const StoreRefAutocomplete = (props: StoreRefAutocompleteProps) => {
  const { stores, value, onChange, label, ...textFieldProps } = props;
  const [inputValue, setInputValue] = useState(value?.storeId);

  const orderedStores = useMemo(() => {
    return [...stores].sort((a, b) => a.storeId.localeCompare(b.storeId));
  }, [stores]);

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
        <TextField {...textFieldProps} {...params} label={label || "Lager"} />
      )}
    />
  );
};

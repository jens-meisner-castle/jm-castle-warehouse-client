import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { StoreSectionRow } from "../../types/RowTypes";

export type StoreSectionRefAutocompleteProps<T extends StoreSectionRow> = {
  value: T | undefined;
  onChange: (section: T | null) => void;
  sections: T[];
  getOptionLabel?: (section: T) => string;
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const StoreSectionRefAutocomplete = <T extends StoreSectionRow>(
  props: StoreSectionRefAutocompleteProps<T>
) => {
  const {
    sections,
    value,
    onChange,
    label,
    getOptionLabel,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.storeId);

  const orderedStoreSections = useMemo(() => {
    return [...sections].sort((a, b) => a.sectionId.localeCompare(b.sectionId));
  }, [sections]);

  return (
    <Autocomplete
      disablePortal
      id="storeRefEditor"
      getOptionLabel={getOptionLabel || ((row) => row.sectionId)}
      options={orderedStoreSections}
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
          label={label || "Lagerbereich"}
        />
      )}
    />
  );
};

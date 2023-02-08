import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { CostunitRow } from "../../types/RowTypes";
import { ErrorData } from "../ErrorDisplays";

export type CostunitRefAutocompleteProps = {
  value: CostunitRow | null | undefined;
  errorData?: ErrorData;
  onChange: (costunit: CostunitRow | null) => void;
  costunits: CostunitRow[];
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const CostunitRefAutocomplete = (
  props: CostunitRefAutocompleteProps
) => {
  const {
    costunits,
    value,
    onChange,
    label,
    errorData,
    helperText,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.unitId);

  const orderedCostunits = useMemo(() => {
    return [...costunits].sort((a, b) => a.unitId.localeCompare(b.unitId));
  }, [costunits]);

  const { error } = errorData || {};

  const usedHelperText =
    error && helperText ? `${helperText}. ${error}` : error || helperText || "";

  return (
    <Autocomplete
      disablePortal
      id="costunitRefEditor"
      getOptionLabel={(row) => row.unitId}
      isOptionEqualToValue={(a, b) => a.unitId === b.unitId}
      options={orderedCostunits}
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
          label={label || "Kostenstelle"}
        />
      )}
    />
  );
};

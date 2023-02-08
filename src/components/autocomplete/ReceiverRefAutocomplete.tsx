import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { ReceiverRow } from "../../types/RowTypes";
import { ErrorData } from "../ErrorDisplays";

export type ReceiverRefAutocompleteProps = {
  value: ReceiverRow | undefined;
  onChange: (receiver: ReceiverRow | null) => void;
  receivers: ReceiverRow[];
  errorData?: ErrorData;
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const ReceiverRefAutocomplete = (
  props: ReceiverRefAutocompleteProps
) => {
  const {
    receivers,
    value,
    onChange,
    label,
    errorData,
    helperText,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.receiverId);

  const orderedReceivers = useMemo(() => {
    return [...receivers].sort((a, b) =>
      a.receiverId.localeCompare(b.receiverId)
    );
  }, [receivers]);

  const { error } = errorData || {};

  const usedHelperText =
    error && helperText ? `${helperText}. ${error}` : error || helperText || "";

  return (
    <Autocomplete
      disablePortal
      id="receiverRefEditor"
      getOptionLabel={(row) => row.receiverId}
      isOptionEqualToValue={(a, b) => a.receiverId === b.receiverId}
      options={orderedReceivers}
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
          label={label || "Empfänger"}
        />
      )}
    />
  );
};

import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { ReceiverRow } from "../../types/RowTypes";

export type ReceiverRefEditorProps = {
  value: ReceiverRow | undefined;
  onChange: (receiver: ReceiverRow | null) => void;
  receivers: ReceiverRow[];
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const ReceiverRefEditor = (props: ReceiverRefEditorProps) => {
  const { receivers, value, onChange, label, ...textFieldProps } = props;
  const [inputValue, setInputValue] = useState(value?.receiverId);

  const orderedReceivers = useMemo(() => {
    return [...receivers].sort((a, b) =>
      a.receiverId.localeCompare(b.receiverId)
    );
  }, [receivers]);

  return (
    <Autocomplete
      disablePortal
      id="receiverRefEditor"
      getOptionLabel={(row) => row.receiverId}
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
          label={label || "Empfänger"}
        />
      )}
    />
  );
};

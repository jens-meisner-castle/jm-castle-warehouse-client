import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import {
  isSavingManufacturerAllowed,
  ManufacturerRow,
} from "../../../../types/RowTypes";

export interface EditManufacturerDialogProps {
  manufacturer: ManufacturerRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ManufacturerRow) => void;
}

export const EditManufacturerDialog = (props: EditManufacturerDialogProps) => {
  const { manufacturer, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(manufacturer);
  const updateData = (updates: Partial<ManufacturerRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { manufacturerId, name } = data;

  const { isSavingAllowed, errorData } = isSavingManufacturerAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Hersteller bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextField
          disabled
          margin="dense"
          id="manufacturerId"
          label="Hersteller"
          value={manufacturerId}
          type="text"
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          value={name}
          errorData={errorData.name}
          onChange={(s) => updateData({ name: s })}
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={!isSavingAllowed} onClick={() => handleAccept(data)}>
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

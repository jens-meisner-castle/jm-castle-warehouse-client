import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import {
  isSavingManufacturerAllowed,
  ManufacturerRow,
} from "../../../../types/RowTypes";

export interface CreateManufacturerDialogProps {
  manufacturer: ManufacturerRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (manufacturer: ManufacturerRow) => void;
}

export const CreateManufacturerDialog = (
  props: CreateManufacturerDialogProps
) => {
  const { manufacturer, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(manufacturer);
  const updateData = (updates: Partial<ManufacturerRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { manufacturerId, name } = data;

  const { isSavingAllowed, errorData } = isSavingManufacturerAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Hersteller"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="manufacturerId"
          label="Hersteller"
          value={manufacturerId}
          errorData={errorData.manufacturerId}
          onChange={(s) => updateData({ manufacturerId: s })}
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
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

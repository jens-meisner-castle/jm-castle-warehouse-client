import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { StoreRow } from "../../../../types/RowTypes";

export interface CreateStoreDialogProps {
  store: StoreRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (store: StoreRow) => void;
}

export const CreateStoreDialog = (props: CreateStoreDialogProps) => {
  const { store, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(store);
  const updateData = (updates: Partial<StoreRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Neues Lager</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="storeId"
          label="Lager"
          value={data.storeId}
          onChange={(s) => updateData({ storeId: s })}
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
          margin="dense"
          id="name"
          label="Name"
          value={data.name}
          onChange={(s) => updateData({ name: s })}
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAccept(data)}>Speichern</Button>
        <Button onClick={handleCancel}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

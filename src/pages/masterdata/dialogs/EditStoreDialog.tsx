import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { StoreRow } from "../../../types/RowTypes";

export interface EditStoreDialogProps {
  store: StoreRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (store: StoreRow) => void;
}

const neverUpdate = () => console.log("never");

export const EditStoreDialog = (props: EditStoreDialogProps) => {
  const { store, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(store);
  const updateData = (updates: Partial<StoreRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Lager bearbeiten</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Führen Sie Ihre Änderungen durch und drücken am Ende 'Speichern'."}
        </DialogContentText>
        <TextField
          disabled
          margin="dense"
          id="storeId"
          label="Lager"
          value={data.storeId}
          onChange={() => neverUpdate()}
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          value={data.name}
          onChange={(event) => updateData({ name: event.target.value })}
          type="text"
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

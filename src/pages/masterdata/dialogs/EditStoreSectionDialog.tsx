import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { StoreRow, StoreSectionRow } from "../../../types/RowTypes";

export interface EditStoreSectionDialogProps {
  section: StoreSectionRow;
  stores: StoreRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (section: StoreSectionRow) => void;
}

const neverUpdate = () => console.log("never");

export const EditStoreSectionDialog = (props: EditStoreSectionDialogProps) => {
  const { section, stores, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(section);
  const updateData = (updates: Partial<StoreSectionRow>) => {
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
          id="sectionId"
          label="Lagerbereich"
          value={data.sectionId}
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
        <TextField
          margin="dense"
          id="storeId"
          select
          label="Lager"
          value={data.storeId}
          onChange={(event) => {
            updateData({ storeId: event.target.value });
          }}
          helperText="Ordnen Sie den Bereich einem Lager zu"
          variant="standard"
        >
          {stores.map((store) => (
            <MenuItem key={store.storeId} value={store.storeId}>
              {`${store.storeId} (${store.name})`}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAccept(data)}>Speichern</Button>
        <Button onClick={handleCancel}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

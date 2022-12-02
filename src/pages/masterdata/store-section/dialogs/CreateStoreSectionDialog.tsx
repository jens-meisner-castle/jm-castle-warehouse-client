import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { StoreRow, StoreSectionRow } from "../../../../types/RowTypes";

export interface CreateStoreSectionDialogProps {
  section: StoreSectionRow;
  stores: StoreRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (section: StoreSectionRow) => void;
}

export const CreateStoreSectionDialog = (
  props: CreateStoreSectionDialogProps
) => {
  const { section, stores, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(section);
  const updateData = (updates: Partial<StoreSectionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Neuer Lagerbereich</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="sectionId"
          label="Lagerbereich"
          value={data.sectionId}
          onChange={(event) => updateData({ sectionId: event.target.value })}
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
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

import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ImageRefsEditor } from "../../../../components/ImageRefsEditor";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { StoreRow, StoreSectionRow } from "../../../../types/RowTypes";

export interface EditStoreSectionDialogProps {
  section: StoreSectionRow;
  stores: StoreRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (section: StoreSectionRow) => void;
}

export const EditStoreSectionDialog = (props: EditStoreSectionDialogProps) => {
  const { section, stores, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(section);
  const { storeId, sectionId, name, imageRefs } = data;

  const updateData = (updates: Partial<StoreSectionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const isSavingAllowed = !!sectionId && !!storeId && !!name;

  return (
    <>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>{"Lagerbereich bearbeiten"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              "Führen Sie Ihre Änderungen durch und drücken am Ende 'Speichern'."
            }
          </DialogContentText>
          <TextField
            disabled
            margin="dense"
            id="sectionId"
            label="Lagerbereich"
            value={sectionId}
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
            onChange={(s) => updateData({ name: s })}
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="storeId"
            select
            label="Lager"
            value={storeId}
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
          <ImageRefsEditor
            imageRefs={imageRefs}
            onChange={(imageRefs) =>
              setData((previous) => ({ ...previous, imageRefs }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!isSavingAllowed}
            onClick={() => handleAccept(data)}
          >
            {"Speichern"}
          </Button>
          <Button onClick={handleCancel}>{"Abbrechen"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ImageRefsEditor } from "../../../../components/multi-ref/ImageRefsEditor";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { isSavingStoreAllowed, StoreRow } from "../../../../types/RowTypes";

export interface EditStoreDialogProps {
  store: StoreRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (store: StoreRow) => void;
}

const neverUpdate = () => console.error("never");

export const EditStoreDialog = (props: EditStoreDialogProps) => {
  const { store, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(store);
  const updateData = (updates: Partial<StoreRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { storeId, name, imageRefs } = data;

  const { isSavingAllowed, errorData } = isSavingStoreAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Lager bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Führen Sie Ihre Änderungen durch und drücken am Ende 'Speichern'."}
        </DialogContentText>
        <TextField
          disabled
          margin="dense"
          id="storeId"
          label="Lager"
          value={storeId}
          onChange={() => neverUpdate()}
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
        <ImageRefsEditor
          imageRefs={imageRefs}
          onChange={(imageRefs) =>
            setData((previous) => ({ ...previous, imageRefs }))
          }
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

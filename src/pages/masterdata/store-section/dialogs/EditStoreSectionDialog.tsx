import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { StoreRefAutocomplete } from "../../../../components/autocomplete/StoreRefAutocomplete";
import { ImageRefsEditor } from "../../../../components/multi-ref/ImageRefsEditor";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import {
  isSavingStoreSectionAllowed,
  StoreRow,
  StoreSectionRow,
} from "../../../../types/RowTypes";

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
  const updateData = (updates: Partial<StoreSectionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  const { storeId, sectionId, name, imageRefs, shortId } = data;
  const currentStore = useMemo(
    () => stores.find((r) => r.storeId === storeId),
    [stores, storeId]
  );
  const { isSavingAllowed, errorData } = isSavingStoreSectionAllowed(data);

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
            margin="dense"
            id="shortId"
            label="Kurzname"
            value={shortId}
            errorData={errorData.shortId}
            onChange={(s) => updateData({ shortId: s })}
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
          <StoreRefAutocomplete
            value={currentStore}
            errorData={errorData.storeId}
            stores={stores}
            onChange={(store) => updateData({ storeId: store?.storeId })}
            margin="dense"
            fullWidth
            variant="standard"
            helperText="Wählen Sie ein Lager"
          />
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

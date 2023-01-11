import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { HashtagRow } from "../../../../types/RowTypes";

export interface CreateHashtagDialogProps {
  hashtag: HashtagRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (hashtag: HashtagRow) => void;
}

export const CreateHashtagDialog = (props: CreateHashtagDialogProps) => {
  const { hashtag, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(hashtag);
  const updateData = (updates: Partial<HashtagRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { tagId, name } = data;
  const isSavingAllowed = !!tagId && !!name;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Hashtag"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="tagId"
          label="Hashtag"
          value={data.tagId}
          onChange={(s) => updateData({ tagId: s })}
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
        <Button disabled={!isSavingAllowed} onClick={() => handleAccept(data)}>
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import {
  HashtagRow,
  isHashtagRow,
  isSavingHashtagAllowed,
} from "../../../../types/RowTypes";

export interface CreateHashtagDialogProps {
  hashtag: Partial<HashtagRow>;
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

  const { isSavingAllowed, errorData } = isSavingHashtagAllowed(data);

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
          value={tagId || ""}
          errorData={errorData.tagId}
          onChange={(s) => updateData({ tagId: s })}
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
          margin="dense"
          id="name"
          label="Name"
          value={name || ""}
          errorData={errorData.name}
          onChange={(s) => updateData({ name: s })}
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!isSavingAllowed}
          onClick={() => isHashtagRow(data) && handleAccept(data)}
        >
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

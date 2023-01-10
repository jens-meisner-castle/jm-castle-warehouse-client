import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { HashtagRow } from "../../../../types/RowTypes";

export interface EditHashtagDialogProps {
  hashtag: HashtagRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: HashtagRow) => void;
}

export const EditHashtagDialog = (props: EditHashtagDialogProps) => {
  const { hashtag, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(hashtag);
  const updateData = (updates: Partial<HashtagRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { tagId, name } = data;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Hashtag bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextField
          disabled
          margin="dense"
          id="tagId"
          label="Artikel"
          value={tagId}
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
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!tagId.length || !name.length}
          onClick={() => handleAccept(data)}
        >
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

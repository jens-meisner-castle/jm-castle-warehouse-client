import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { HashtagRow, isSavingHashtagAllowed } from "../../../../types/RowTypes";

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

  const { isSavingAllowed, errorData } = isSavingHashtagAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Hashtag bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          disabled
          margin="dense"
          id="tagId"
          label="Tag ID"
          value={tagId}
          errorData={errorData.tagId}
          onChange={(s) => updateData({ tagId: s })}
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

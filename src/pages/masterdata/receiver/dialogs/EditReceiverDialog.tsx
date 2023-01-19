import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { ReceiverRow } from "../../../../types/RowTypes";

export interface EditReceiverDialogProps {
  receiver: ReceiverRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ReceiverRow) => void;
}

export const EditReceiverDialog = (props: EditReceiverDialogProps) => {
  const { receiver, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(receiver);
  const updateData = (updates: Partial<ReceiverRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { receiverId, name, mailAddress } = data;
  const isSavingAllowed =
    !!receiverId?.length && !!name?.length && !!mailAddress?.length;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Empfänger bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextField
          disabled
          margin="dense"
          id="receiverId"
          label="Empfänger"
          value={receiverId}
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
          id="mailAddress"
          label="Mail Adresse"
          value={mailAddress}
          onChange={(event) => updateData({ mailAddress: event.target.value })}
          type="email"
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

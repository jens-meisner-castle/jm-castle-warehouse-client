import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import {
  isSavingReceiverAllowed,
  ReceiverRow,
} from "../../../../types/RowTypes";

export interface CreateReceiverDialogProps {
  receiver: ReceiverRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (receiver: ReceiverRow) => void;
}

export const CreateReceiverDialog = (props: CreateReceiverDialogProps) => {
  const { receiver, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(receiver);
  const updateData = (updates: Partial<ReceiverRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { receiverId, name, mailAddress } = data;

  const { isSavingAllowed, errorData } = isSavingReceiverAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Empfänger"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="receiverId"
          label="Empfänger"
          value={receiverId}
          errorData={errorData.receiverId}
          onChange={(s) => updateData({ receiverId: s })}
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
          margin="dense"
          id="name"
          label="Name"
          value={name}
          errorData={errorData.name}
          onChange={(s) => updateData({ name: s })}
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
          margin="dense"
          id="mailAddress"
          label="Mail Adresse"
          value={mailAddress}
          onChange={(s) => updateData({ mailAddress: s })}
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

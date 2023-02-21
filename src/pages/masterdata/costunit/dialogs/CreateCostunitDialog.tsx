import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import {
  CostunitRow,
  isCostunitRow,
  isSavingCostunitAllowed,
} from "../../../../types/RowTypes";

export interface CreateCostunitDialogProps {
  hashtag: Partial<CostunitRow>;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (hashtag: CostunitRow) => void;
}

export const CreateCostunitDialog = (props: CreateCostunitDialogProps) => {
  const { hashtag, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(hashtag);
  const updateData = (updates: Partial<CostunitRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { unitId, name } = data;

  const { isSavingAllowed, errorData } = isSavingCostunitAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neue Kostenstelle"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="unitId"
          label="Kostenstelle"
          value={unitId || ""}
          errorData={errorData.unitId}
          onChange={(s) => updateData({ unitId: s })}
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
          onClick={() => isCostunitRow(data) && handleAccept(data)}
        >
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { AttributeEditor } from "../../../../components/row-editor/AttributeEditor";
import {
  AttributeRow,
  isSavingAttributeAllowed,
} from "../../../../types/RowTypes";

export interface CreateAttributeDialogProps {
  attribute: AttributeRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (attribute: AttributeRow) => void;
}

export const CreateAttributeDialog = (props: CreateAttributeDialogProps) => {
  const { attribute, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(attribute);
  const updateData = (updates: Partial<AttributeRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  const { isSavingAllowed } = isSavingAttributeAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neues Lager"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <AttributeEditor mode="create" row={data} onChange={updateData} />
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

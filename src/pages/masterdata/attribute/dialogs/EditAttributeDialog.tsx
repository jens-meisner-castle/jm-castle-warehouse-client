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

export interface EditAttributeDialogProps {
  attribute: AttributeRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (attribute: AttributeRow) => void;
}

export const EditAttributeDialog = (props: EditAttributeDialogProps) => {
  const { attribute, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(attribute);
  const updateData = (updates: Partial<AttributeRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  const { isSavingAllowed } = isSavingAttributeAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Attribut bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Führen Sie Ihre Änderungen durch und drücken am Ende 'Speichern'."}
        </DialogContentText>
        <AttributeEditor mode="edit" row={data} onChange={updateData} />
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

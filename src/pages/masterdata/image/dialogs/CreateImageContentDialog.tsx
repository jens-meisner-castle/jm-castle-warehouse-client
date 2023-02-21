import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import {
  ImageContentEditor,
  ImageContentEditState,
} from "../../../../components/row-editor/ImageContentEditor";
import {
  ImageContentRow,
  isSavingImageContentAllowed,
} from "../../../../types/RowTypes";

export interface CreateImageContentDialogProps {
  imageContent: Partial<ImageContentRow>;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ImageContentEditState) => void;
}

export const CreateImageContentDialog = (
  props: CreateImageContentDialogProps
) => {
  const { imageContent, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState<ImageContentEditState>({
    row: imageContent,
  });
  const updateData = (updates: Partial<ImageContentEditState>) => {
    const { newImage, row } = updates;
    setData((previous) => ({
      newImage: newImage || previous.newImage,
      row: row ? { ...previous.row, ...row } : previous.row,
    }));
  };

  const { newImage, row } = data;

  const { file } = newImage || {};

  const { isSavingAllowed } = isSavingImageContentAllowed(row);

  const disableSave = !isSavingAllowed || !file;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neues Bild"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <ImageContentEditor mode="create" data={data} onChange={updateData} />
      </DialogContent>
      <DialogActions>
        <Button disabled={disableSave} onClick={() => handleAccept(data)}>
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

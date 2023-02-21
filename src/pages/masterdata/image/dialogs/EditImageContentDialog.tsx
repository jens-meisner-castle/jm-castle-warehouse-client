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
import { ImageContentRow } from "../../../../types/RowTypes";

export interface EditImageContentDialogProps {
  imageContent: Partial<ImageContentRow>;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ImageContentEditState) => void;
}

export const EditImageContentDialog = (props: EditImageContentDialogProps) => {
  const { imageContent, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState<ImageContentEditState>({
    row: imageContent,
  });

  const { newImage } = data;

  const updateData = (updates: Partial<ImageContentEditState>) => {
    const { newImage, row } = updates;
    setData((previous) => ({
      newImage: newImage || previous.newImage,
      row: row ? { ...previous.row, ...row } : previous.row,
    }));
  };

  const { file } = newImage || {};

  // Bild muss geändert worden sein
  const isSavingAllowed = !!file;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Bild bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <ImageContentEditor mode="edit" data={data} onChange={updateData} />
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

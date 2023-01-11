import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useCallback, useMemo, useState } from "react";
import { ImageInputField } from "../../../../components/ImageInputField";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { ImageContentRow } from "../../../../types/RowTypes";
import { getExtension } from "../../../../utils/File";
import { ImageContentEditState } from "../Types";

export interface CreateImageContentDialogProps {
  imageContent: ImageContentRow;
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
  const updateData = (updates: Partial<ImageContentRow>) => {
    setData((previous) => ({
      ...previous,
      row: { ...previous.row, ...updates },
    }));
  };
  const handleImageChange = useCallback(
    (file: File | undefined, filePath: string | undefined) => {
      if (file && filePath) {
        const imageExtension = getExtension(filePath);
        const sizeInBytes = file.size;
        setData((previous) => ({
          row: { ...previous.row, imageExtension, sizeInBytes },
          newImage: { file, extension: imageExtension },
        }));
      }
    },
    []
  );
  const { newImage, row } = data;
  const { imageId, sizeInBytes } = row;
  const { file } = newImage || {};
  const imageUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file]
  );
  const isSavingAllowed = !!imageId && !!file;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neues Bild"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="imageId"
          label="Bild ID"
          value={imageId}
          onChange={(s) => updateData({ imageId: s })}
          fullWidth
          variant="standard"
        />
        <ImageInputField label="Bild" onChange={handleImageChange} />
        <TextField
          disabled
          margin="dense"
          id="sizeInBytes"
          label="Dateigröße (bytes)"
          value={sizeInBytes.toString()}
          type="text"
          fullWidth
          variant="standard"
        />
        {imageUrl && (
          <TextField
            id="imageDisplay"
            margin="normal"
            variant="standard"
            disabled
            fullWidth
            InputProps={{
              startAdornment: imageUrl && (
                <img
                  src={imageUrl}
                  alt={imageId}
                  style={{ maxWidth: "30vw" }}
                />
              ),
            }}
          />
        )}
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

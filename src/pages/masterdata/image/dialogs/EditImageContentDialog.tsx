import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useCallback, useMemo, useState } from "react";
import { ImageInputField } from "../../../../components/ImageInputField";
import {
  backendApiUrl,
  getImageDisplayUrl,
} from "../../../../configuration/Urls";
import { ImageContentRow } from "../../../../types/RowTypes";
import { getExtension } from "../../../../utils/File";
import { ImageContentEditState } from "../Types";

export interface EditImageContentDialogProps {
  imageContent: ImageContentRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ImageContentEditState) => void;
}

export const EditImageContentDialog = (props: EditImageContentDialogProps) => {
  const { imageContent, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState<ImageContentEditState>({
    row: imageContent,
  });

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
  const { row, newImage } = data;
  const { imageId, imageExtension, sizeInBytes, datasetVersion } = row;
  const { file } = newImage || {};
  const imageUrl = useMemo(
    () =>
      file
        ? URL.createObjectURL(file)
        : getImageDisplayUrl(backendApiUrl, imageId, datasetVersion),
    [file, imageId, datasetVersion]
  );

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Bild bearbeiten"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextField
          disabled
          margin="dense"
          id="imageId"
          label="Bild ID"
          value={imageId}
          type="text"
          fullWidth
          variant="standard"
        />
        <ImageInputField label="Bild" onChange={handleImageChange} />
        <TextField
          disabled
          margin="dense"
          id="imageExtension"
          label="Dateiendung"
          value={imageExtension}
          type="text"
          fullWidth
          variant="standard"
        />
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
        <Button disabled={!file} onClick={() => handleAccept(data)}>
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

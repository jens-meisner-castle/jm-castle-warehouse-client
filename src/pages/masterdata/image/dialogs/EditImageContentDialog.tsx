import ImageIcon from "@mui/icons-material/Image";
import { IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const imageInputRef = useRef<HTMLInputElement>();
  const [filePath, setFilePath] = useState<string | undefined>(undefined);
  const file =
    filePath && imageInputRef.current && imageInputRef.current.files
      ? imageInputRef.current.files[0]
      : undefined;
  useEffect(() => {
    if (file && filePath) {
      const newExtension = getExtension(filePath);
      const newSizeInBytes = file.size;
      const newImage =
        file && filePath ? { extension: newExtension, file } : null;
      setData((previous) => ({
        row: {
          ...previous.row,
          imageExtension: newExtension,
          sizeInBytes: newSizeInBytes,
        },
        newImage,
      }));
    }
  }, [file, filePath]);

  const clickOnInvisibleImageInput = useCallback(() => {
    imageInputRef.current && imageInputRef.current.click();
  }, [imageInputRef]);
  const { imageId, imageExtension, sizeInBytes } = data.row;
  const imageUrl = useMemo(
    () =>
      file
        ? URL.createObjectURL(file)
        : getImageDisplayUrl(backendApiUrl, imageId),
    [file, imageId]
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
        <TextField
          margin="dense"
          id="image"
          label="Bild"
          disabled
          value={filePath || ""}
          type="text"
          fullWidth
          variant="standard"
          InputProps={{
            endAdornment: (
              <IconButton onClick={clickOnInvisibleImageInput}>
                <ImageIcon />
              </IconButton>
            ),
          }}
        />
        <TextField
          inputRef={imageInputRef}
          style={{ display: "none" }}
          margin="dense"
          id="articleImageInput"
          label="Bild"
          value={filePath || ""}
          onChange={(event) => setFilePath(event.target.value)}
          type="file"
          inputProps={{ accept: "image/*" }}
          fullWidth
          variant="standard"
        />
        <TextField
          id="articleImageDisplay"
          margin="normal"
          variant="standard"
          disabled
          fullWidth
          InputProps={{
            startAdornment: imageUrl && (
              <img
                src={imageUrl}
                alt={filePath || imageId}
                style={{ maxWidth: "30vw" }}
              />
            ),
          }}
        />
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

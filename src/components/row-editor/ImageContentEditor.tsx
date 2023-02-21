import TextField from "@mui/material/TextField";
import { useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import {
  ImageContentRow,
  isSavingImageContentAllowed,
} from "../../types/RowTypes";
import { getExtension } from "../../utils/File";
import { ImageInputField } from "../ImageInputField";
import { TextFieldWithSpeech } from "../TextFieldWithSpeech";

export interface ImageFile {
  file: File;
  extension: string;
}

export interface ImageContentEditState {
  row: Partial<ImageContentRow>;
  newImage?: ImageFile | null;
}

export interface ImageContentEditorProps {
  data: ImageContentEditState;
  mode: "edit" | "create";
  onChange: (updates: Partial<ImageContentEditState>) => void;
}

export const ImageContentEditor = (props: ImageContentEditorProps) => {
  const { data, mode, onChange } = props;

  const { row, newImage } = data;

  const { errorData } = isSavingImageContentAllowed(row);

  const handleImageChange = useCallback(
    (file: File | undefined, filePath: string | undefined) => {
      if (file && filePath) {
        const imageExtension = getExtension(filePath);
        const sizeInBytes = file.size;
        onChange({
          row: { ...row, imageExtension, sizeInBytes },
          newImage: { file, extension: imageExtension },
        });
      }
    },
    [row, onChange]
  );

  const { imageId, imageExtension, sizeInBytes, datasetVersion } = row;
  const { file } = newImage || {};
  const imageUrl = useMemo(
    () =>
      file
        ? URL.createObjectURL(file)
        : mode === "create"
        ? undefined
        : getImageDisplayUrl(backendApiUrl, imageId, datasetVersion),
    [file, mode, imageId, datasetVersion]
  );

  return (
    <div>
      <TextFieldWithSpeech
        autoFocus={mode === "create"}
        disabled={mode === "edit"}
        margin="dense"
        id="imageId"
        label="Bild ID"
        value={imageId || ""}
        errorData={errorData.imageId}
        onChange={(s) => onChange({ row: { imageId: s } })}
        fullWidth
        variant="standard"
      />
      <ImageInputField label="Bild" onChange={handleImageChange} />
      <TextField
        disabled
        margin="dense"
        id="imageExtension"
        label="Dateiendung"
        value={imageExtension || ""}
        type="text"
        fullWidth
        variant="standard"
      />
      <TextField
        disabled
        margin="dense"
        id="sizeInBytes"
        label="Dateigröße (bytes)"
        value={typeof sizeInBytes === "number" ? sizeInBytes.toString() : ""}
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
              <img src={imageUrl} alt={imageId} style={{ maxWidth: "30vw" }} />
            ),
          }}
        />
      )}
    </div>
  );
};

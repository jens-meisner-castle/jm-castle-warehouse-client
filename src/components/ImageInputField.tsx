import ImageIcon from "@mui/icons-material/Image";
import { IconButton, TextField } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

export const allowedImageTypes = ".JPEG,.PNG,.WebP,.GIF,.AVIF,.TIFF";

export interface FileInputFieldProps {
  label: string;
  acceptInput?: string;
  onChange: (file: File | undefined, filePath: string | undefined) => void;
}

export const ImageInputField = (props: FileInputFieldProps) => {
  const { onChange, label, acceptInput } = props;

  const usedAcceptInput = acceptInput || allowedImageTypes;
  const fileInputRef = useRef<HTMLInputElement>();
  const [filePath, setFilePath] = useState<string | undefined>(undefined);
  const clickOnInvisibleFileInput = useCallback(() => {
    fileInputRef.current && fileInputRef.current.click();
  }, [fileInputRef]);

  const file =
    filePath && fileInputRef.current && fileInputRef.current.files
      ? fileInputRef.current.files[0]
      : undefined;

  useEffect(() => {
    onChange(file, filePath);
  }, [onChange, file, filePath]);

  return (
    <>
      <TextField
        margin="dense"
        id="fileField"
        label={label}
        disabled
        value={filePath || ""}
        type="text"
        fullWidth
        variant="standard"
        InputProps={{
          endAdornment: (
            <>
              <IconButton onClick={clickOnInvisibleFileInput}>
                <ImageIcon />
              </IconButton>
            </>
          ),
        }}
      />
      <TextField
        inputRef={fileInputRef}
        style={{ display: "none" }}
        margin="dense"
        id="fileInput"
        label="Datei"
        value={filePath || ""}
        onChange={(event) => setFilePath(event.target.value)}
        type="file"
        inputProps={{ accept: usedAcceptInput }}
        fullWidth
        variant="standard"
      />
    </>
  );
};

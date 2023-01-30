import FileOpenIcon from "@mui/icons-material/FileOpen";
import { Grid, IconButton, TextField, TextFieldProps } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFilename } from "../utils/File";

export type FileInputFieldProps = {
  label: string;
  acceptInput: string;
  onChange: (file: File | undefined) => void;
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const FileInputField = (props: FileInputFieldProps) => {
  const { onChange, label, acceptInput, ...textFieldProps } = props;

  const fileInputRef = useRef<HTMLInputElement>();

  const [filePath, setFilePath] = useState<string | undefined>(undefined);

  const filename = useMemo(() => {
    return filePath ? getFilename(filePath) : undefined;
  }, [filePath]);

  const clickOnInvisibleFileInput = useCallback(() => {
    fileInputRef.current && fileInputRef.current.click();
  }, [fileInputRef]);

  const file =
    filePath && fileInputRef.current && fileInputRef.current.files
      ? fileInputRef.current.files[0]
      : undefined;

  useEffect(() => {
    onChange(file);
  }, [onChange, file]);

  return (
    <Grid container>
      <Grid item>
        <TextField
          {...textFieldProps}
          margin="dense"
          id="fileField"
          label={label}
          disabled
          value={filename || ""}
          type="text"
          fullWidth
          variant="standard"
          InputProps={{
            endAdornment: (
              <>
                <IconButton onClick={clickOnInvisibleFileInput}>
                  <FileOpenIcon />
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
          inputProps={{ accept: acceptInput }}
          fullWidth
          variant="standard"
        />
      </Grid>
    </Grid>
  );
};

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { FileInputField } from "../../../components/FileInputField";
import { TextareaComponent } from "../../../components/TextareaComponent";
import { backendApiUrl } from "../../../configuration/Urls";
import { useDbImportFile } from "../../../hooks/useDbImportFile";

export const DbImportPart = () => {
  const [updateIndicator, setUpdateIndicator] = useState(0);
  const [file, setFile] = useState<File | undefined>(undefined);
  const handleExpiredToken = useHandleExpiredToken();

  const importFileApiResponse = useDbImportFile(
    backendApiUrl,
    file,
    updateIndicator,
    handleExpiredToken
  );
  const { response } = importFileApiResponse;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.importFile = importFileApiResponse;
    return newData;
  }, [importFileApiResponse]);

  const executeImport = useCallback(() => {
    file && setUpdateIndicator((previous) => previous + 1);
  }, [file]);

  const isButtonDisabled = !file || (!!updateIndicator && !response);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h6">{"Database import"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <FileInputField
            onChange={setFile}
            label="Import file (.zip)"
            acceptInput=".zip"
          />
          <Tooltip title={"Import the selected file."}>
            <span>
              <IconButton disabled={isButtonDisabled} onClick={executeImport}>
                <CloudUploadIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Paper>
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper>
          <TextareaComponent
            value={response || ""}
            formatObject
            maxRows={12}
            style={{
              width: "90%",
              resize: "none",
              marginRight: 30,
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

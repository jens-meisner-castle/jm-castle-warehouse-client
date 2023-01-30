import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { FileInputField } from "../../components/FileInputField";
import { TextareaComponent } from "../../components/TextareaComponent";
import { backendApiUrl } from "../../configuration/Urls";
import { useDbImportFile } from "../../hooks/useDbImportFile";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(0);
  const [file, setFile] = useState<File | undefined>(undefined);

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

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <CloudUploadIcon />,
      tooltip: "Importieren",
      disabled: !file || (!!updateIndicator && !response),
      onClick: executeImport,
    });
    return newActions;
  }, [executeImport, response, updateIndicator, file]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System Import"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      <Grid item>
        <Paper>
          <FileInputField
            style={{ minWidth: 250 }}
            onChange={setFile}
            label="Importdatei (.zip)"
            acceptInput=".zip"
            helperText={
              !file
                ? "Bitte wählen Sie zunächst eine Datei aus."
                : "Nun können Sie den Import starten."
            }
          />
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

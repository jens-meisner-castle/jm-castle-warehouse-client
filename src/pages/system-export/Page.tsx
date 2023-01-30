import { CloudDownload, FileDownload } from "@mui/icons-material";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { TextareaComponent } from "../../components/TextareaComponent";
import { backendApiUrl } from "../../configuration/Urls";
import { useDbExport } from "../../hooks/useDbExport";
import { useDbExportFile } from "../../hooks/useDbExportFile";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(0);

  const dbExportApiResponse = useDbExport(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: dbExportResponse } = dbExportApiResponse;

  const exportFileApiResponse = useDbExportFile(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: exportFileResponse } = exportFileApiResponse;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.dbExport = dbExportApiResponse;
    newData.exportFile = exportFileApiResponse;
    return newData;
  }, [dbExportApiResponse, exportFileApiResponse]);

  const { blob, filename } = exportFileResponse || {};
  const downloadUrl = useMemo(() => {
    return blob ? URL.createObjectURL(blob) : undefined;
  }, [blob]);

  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const download = useCallback(() => {
    anchorRef.current?.click();
    downloadUrl && URL.revokeObjectURL(downloadUrl);
    setUpdateIndicator(0);
  }, [downloadUrl]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <CloudDownload />,
      tooltip: "Exportdaten erzeugen",
      disabled: !!updateIndicator && !dbExportResponse,
      onClick: () => setUpdateIndicator((previous) => previous + 1),
    });
    newActions.push({
      label: <FileDownload />,
      tooltip: "Datei herunterladen",
      disabled: !filename,
      onClick: download,
    });
    return newActions;
  }, [download, filename, updateIndicator, dbExportResponse]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Database export"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      {downloadUrl && (
        <Grid item>
          <a
            href={downloadUrl}
            download={filename || true}
            ref={anchorRef}
            style={{ display: "none" }}
          ></a>
        </Grid>
      )}
      <Grid item>
        <Paper>
          <TextareaComponent
            value={dbExportResponse || ""}
            formatObject
            maxRows={50}
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

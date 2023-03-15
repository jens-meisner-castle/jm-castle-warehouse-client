import { CloudDownload, FileDownload } from "@mui/icons-material";
import { Grid, Paper, Typography } from "@mui/material";
import {
  AppAction,
  AppActions,
  TextareaComponent,
} from "jm-castle-components/build";
import { useCallback, useMemo, useRef, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { backendApiUrl } from "../../configuration/Urls";
import { useSystemExportFile } from "../../hooks/useSystemExportFile";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(0);

  const exportFileApiResponse = useSystemExportFile(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: exportFileResponse } = exportFileApiResponse;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.exportFile = exportFileApiResponse;
    return newData;
  }, [exportFileApiResponse]);

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
      disabled: !!updateIndicator && !blob,
      onClick: () => setUpdateIndicator((previous) => previous + 1),
    });
    newActions.push({
      label: <FileDownload />,
      tooltip: "Datei herunterladen",
      disabled: !filename,
      onClick: download,
    });
    return newActions;
  }, [download, filename, updateIndicator, blob]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System export"}</Typography>
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
            value={filename || ""}
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

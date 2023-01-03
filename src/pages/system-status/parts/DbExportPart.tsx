import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { ErrorDisplay } from "../../../components/ErrorDisplay";
import { TextareaComponent } from "../../../components/TextareaComponent";
import { backendApiUrl } from "../../../configuration/Urls";
import { useDbExport } from "../../../hooks/useDbExport";
import { useDbExportFile } from "../../../hooks/useDbExportFile";

export const DbExportPart = () => {
  const [updateIndicator, setUpdateIndicator] = useState(0);
  const { response, error, errorCode, errorDetails } = useDbExport(
    backendApiUrl,
    updateIndicator
  );
  const {
    error: fileError,
    response: fileResponse,
    errorCode: fileErrorCode,
  } = useDbExportFile(backendApiUrl, updateIndicator);

  const { blob, filename } = fileResponse || {};
  const downloadUrl = useMemo(() => {
    return blob ? URL.createObjectURL(blob) : undefined;
  }, [blob]);

  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const download = useCallback(() => {
    anchorRef.current?.click();
    downloadUrl && URL.revokeObjectURL(downloadUrl);
    setUpdateIndicator(0);
  }, [downloadUrl]);

  const isButtonDisabled = !!updateIndicator && !response && !error;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h6">{"Database export"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <Tooltip title={"Create new export file."}>
            <IconButton
              disabled={isButtonDisabled}
              onClick={() => setUpdateIndicator((previous) => previous + 1)}
            >
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>
          {filename && (
            <Tooltip title={`Download the export ${filename}`}>
              <IconButton
                onClick={() => {
                  download();
                }}
              >
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Paper>
      </Grid>
      <Grid item>
        <ErrorDisplay error={fileError} errorCode={fileErrorCode} />
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
      <Grid item>
        <Paper>
          <ErrorDisplay
            error={error}
            errorCode={errorCode}
            errorDetails={errorDetails}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

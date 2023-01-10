import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { TextareaComponent } from "../../../components/TextareaComponent";
import { backendApiUrl } from "../../../configuration/Urls";
import { useDbExport } from "../../../hooks/useDbExport";
import { useDbExportFile } from "../../../hooks/useDbExportFile";

export const DbExportPart = () => {
  const [updateIndicator, setUpdateIndicator] = useState(0);

  const dbExportApiResponse = useDbExport(backendApiUrl, updateIndicator);
  const { response: dbExportResponse } = dbExportApiResponse;

  const exportFileApiResponse = useDbExportFile(backendApiUrl, updateIndicator);
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

  const isButtonDisabled = !!updateIndicator && !dbExportResponse;

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

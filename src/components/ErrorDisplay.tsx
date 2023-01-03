import { Grid, Typography } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { TextareaComponent } from "./TextareaComponent";

export interface ErrorDisplayProps {
  leftColumnWidth?: number | string;
  error?: string;
  errorCode?: ErrorCode;
  errorDetails?: Record<string, unknown>;
}

export const ErrorDisplay = (props: ErrorDisplayProps) => {
  const { error, errorCode, errorDetails, leftColumnWidth } = props;
  const usedLeftColumnWidth = leftColumnWidth || 200;
  return (
    <Grid container direction="column">
      {errorCode && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: usedLeftColumnWidth }}>
              <Typography>{"Error code"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <Typography>{errorCode}</Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      {error && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: usedLeftColumnWidth }}>
              <Typography>{"Error"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={error}
                maxRows={10}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
      {errorDetails && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: usedLeftColumnWidth }}>
              <Typography>{"Error details"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={errorDetails}
                formatObject
                maxRows={10}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

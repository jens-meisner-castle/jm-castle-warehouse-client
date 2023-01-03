import CheckIcon from "@mui/icons-material/Check";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Grid, IconButton, Typography } from "@mui/material";
import { SystemStatus } from "jm-castle-warehouse-types/build";
import { DateTime } from "luxon";
import { useState } from "react";
import { getDateFormat } from "../utils/Format";
import { TextareaComponent } from "./TextareaComponent";

export interface SystemStatusComponentProps {
  status: SystemStatus | undefined;
}

export const SystemStatusComponent = (props: SystemStatusComponentProps) => {
  const { status } = props;
  const { startedAt, configuration } = status || {};
  const { content, valid } = configuration || {};
  const { isValid } = content || {};
  const leftColumnWidth = 200;

  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [isValidConfigVisible, setIsValidConfigVisible] = useState(false);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <Typography variant="h6">{"System status"}</Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Last start at"}</Typography>
          </Grid>
          <Grid item style={{ maxWidth: 800 }}>
            <Typography>
              {startedAt
                ? DateTime.fromMillis(startedAt).toFormat(
                    getDateFormat("second")
                  )
                : "never"}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Configuration (external)"}</Typography>
            {isValid ? <CheckIcon /> : <HighlightOffIcon />}
            <IconButton
              onClick={() => setIsConfigVisible((previous) => !previous)}
            >
              <MoreHorizIcon />
            </IconButton>
          </Grid>
          <Grid item flexGrow={1}>
            {isConfigVisible && content && (
              <TextareaComponent
                value={content}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
                formatObject
                maxRows={20}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Configuration (valid)"}</Typography>
            {isValid ? <CheckIcon /> : <HighlightOffIcon />}
            <IconButton
              onClick={() => setIsValidConfigVisible((previous) => !previous)}
            >
              <MoreHorizIcon />
            </IconButton>
          </Grid>
          <Grid item flexGrow={1}>
            {isValidConfigVisible && valid && (
              <TextareaComponent
                value={valid}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
                formatObject
                maxRows={20}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

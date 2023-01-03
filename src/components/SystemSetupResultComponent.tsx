import { Grid, Typography } from "@mui/material";
import { ExecuteSetupResponse } from "jm-castle-warehouse-types/build";
import { TextareaComponent } from "./TextareaComponent";

export interface SystemSetupResultComponentProps {
  setupResult: ExecuteSetupResponse["setup"] | undefined;
}

export const SystemSetupResultComponent = (
  props: SystemSetupResultComponentProps
) => {
  const { setupResult } = props;
  const { createDb, createTables } = setupResult || {};
  const { cmds: createDbCmds, result: createDbResult } = createDb || {};
  const { cmds: createTablesCmds, result: createTablesResult } =
    createTables || {};
  const leftColumnWidth = 200;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{"Setup result"}</Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Database result"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={createDbResult || "?"}
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
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Database commands"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={createDbCmds || "?"}
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
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Tables result"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={createTablesResult || "?"}
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
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Database commands"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={createTablesCmds || "?"}
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
    </Grid>
  );
};

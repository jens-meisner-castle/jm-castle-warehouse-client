import { Grid, Typography } from "@mui/material";
import { ExecuteSetupResponse } from "jm-castle-types/build";
import { TextareaComponent } from "./TextareaComponent";

export interface SystemSetupResultComponentProps {
  setupResult: ExecuteSetupResponse["setup"] | undefined;
}

export const SystemSetupResultComponent = (
  props: SystemSetupResultComponentProps
) => {
  const { setupResult } = props;
  const { createDb, createTables, alterTables } = setupResult || {};
  const { cmds: createDbCmds, result: createDbResult } = createDb || {};
  const { cmds: createTablesCmds, result: createTablesResult } =
    createTables || {};
  const { cmds: alterTablesCmds, result: alterTablesResult } =
    alterTables || {};
  const leftColumnWidth = 200;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{"Setup Ergebnis"}</Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Datenbank (create) Ergebnis"}</Typography>
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
            <Typography>{"Datenbank (create) Kommandos"}</Typography>
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
            <Typography>{"Tabellen (create) Ergebnis"}</Typography>
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
            <Typography>{"Tabellen (create) Kommandos"}</Typography>
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
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Tabellen (alter) Ergebnis"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={alterTablesResult || "?"}
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
            <Typography>{"Tabellen (alter) Kommandos"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={alterTablesCmds || "?"}
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

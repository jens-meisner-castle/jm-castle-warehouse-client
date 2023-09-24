import { Grid, Typography } from "@mui/material";
import { SystemSetupStatus } from "jm-castle-types/build";
import { TableStatusComponent } from "./TableStatusComponent.js";

export interface SystemSetupStatusComponentProps {
  status: SystemSetupStatus | undefined;
}

export const SystemSetupStatusComponent = (
  props: SystemSetupStatusComponentProps
) => {
  const { status } = props;
  const { database, software } = status || {};
  const { name, tables: tablesInDatabase } = database || {};
  const { tables: tablesInSoftware } = software || {};
  const leftColumnWidth = 200;

  return (
    <>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h6">{"Status"}</Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Datenbank"}</Typography>
            </Grid>
            <Grid item>
              <Typography>{name || "?"}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Tabellen"}</Typography>
            </Grid>
            <Grid item>
              <Typography>
                {tablesInDatabase ? Object.keys(tablesInDatabase).length : "?"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {tablesInDatabase &&
        tablesInSoftware &&
        Object.keys(tablesInDatabase)
          .sort()
          .map((table) => (
            <TableStatusComponent
              key={table}
              status={tablesInDatabase[table]}
              targetStatus={tablesInSoftware[table]}
            />
          ))}
    </>
  );
};

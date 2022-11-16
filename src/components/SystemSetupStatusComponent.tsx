import { Grid, Typography } from "@mui/material";
import { SystemSetupStatus } from "jm-castle-warehouse-types/build";

export interface SystemSetupStatusComponentProps {
  status: SystemSetupStatus | undefined;
}

export const SystemSetupStatusComponent = (
  props: SystemSetupStatusComponentProps
) => {
  const { status } = props;
  const { database } = status || {};
  const { name, tables } = database || {};
  const leftColumnWidth = 200;

  return (
    <Grid container direction="column">
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Database"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{name || "?"}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Tables"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{tables ? Object.keys(tables).length : "?"}</Typography>
          </Grid>
        </Grid>
      </Grid>
      {tables &&
        Object.keys(tables)
          .sort()
          .map((table) => (
            <Grid key={table} item>
              <Grid container direction="row">
                <Grid item style={{ width: leftColumnWidth }}>
                  <Typography>{tables[table].name}</Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    {tables[table].isCreated ? "Ok" : "missing"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          ))}
    </Grid>
  );
};

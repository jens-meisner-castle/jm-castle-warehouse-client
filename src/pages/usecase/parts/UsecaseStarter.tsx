import { Grid, Paper, Typography } from "@mui/material";
import { useUsecaseState } from "../../../usecases/context/UsecaseContext";
import { InventoryStarter } from "../../../usecases/inventory/InventoryStarter";

export const UsecaseStarter = () => {
  const usecaseState = useUsecaseState();
  const { id } = usecaseState || {};

  return id !== "empty" ? (
    <></>
  ) : (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Anwendungsfälle"}</Typography>
        <Grid container direction="row">
          <Grid item>
            <Paper style={{ padding: 5, margin: 5, marginLeft: 0 }}>
              <InventoryStarter />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

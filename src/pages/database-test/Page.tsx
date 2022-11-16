import { Grid, Paper, Typography } from "@mui/material";
import { SelectFromStore } from "../../tests/database/SelectFromStore";

export const Page = () => {
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Some tests"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <SelectFromStore />
        </Paper>
      </Grid>
    </Grid>
  );
};

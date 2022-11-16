import { Grid, Typography } from "@mui/material";
import { ApiServices } from "./parts/ApiServices";

export const Page = () => {
  return (
    <Grid container direction="column" gap={2}>
      <Grid item>
        <Typography variant="h5">{"Help"}</Typography>
      </Grid>
      <Grid item>
        <ApiServices />
      </Grid>
    </Grid>
  );
};

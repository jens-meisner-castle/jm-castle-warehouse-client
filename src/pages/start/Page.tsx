import { Grid, Paper, Typography } from "@mui/material";
import { TextComponent } from "../../components/TextComponent";
import { welcome } from "./Welcome";

export const Page = () => {
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Start page"}</Typography>
        <Paper>
          <div style={{ alignContent: "space-around", alignItems: "center" }}>
            <TextComponent
              value={welcome}
              fullWidth
              multiline
              inputProps={{ style: { textAlign: "center" } }}
            />
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

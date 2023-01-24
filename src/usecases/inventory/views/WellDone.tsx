import { Grid, Paper } from "@mui/material";
import { TextComponent } from "../../../components/TextComponent";

export const WellDone = () => {
  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <div style={{ alignContent: "space-around", alignItems: "center" }}>
            <TextComponent
              value={"Well done!"}
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

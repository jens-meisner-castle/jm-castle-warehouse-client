import { Grid, Paper } from "@mui/material";
import { TextComponent } from "jm-castle-components/build";

export interface ExecutionProps {
  description: string;
}
export const Execution = (props: ExecutionProps) => {
  const { description } = props;
  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <div style={{ alignContent: "space-around", alignItems: "center" }}>
            <TextComponent
              value={description}
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

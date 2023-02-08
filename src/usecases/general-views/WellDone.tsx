import { Grid, Paper } from "@mui/material";
import { AppAction } from "../../components/AppActions";
import { TextComponent } from "../../components/TextComponent";
import { ViewFrame } from "../../components/usecase/ViewFrame";

export interface WellDoneProps {
  description: string;
  actions: AppAction[];
}

export const WellDone = (props: WellDoneProps) => {
  const { description, actions } = props;

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <Grid container direction="column">
          <Grid item>
            <Paper>
              <div
                style={{ alignContent: "space-around", alignItems: "center" }}
              >
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
      </div>
    </ViewFrame>
  );
};

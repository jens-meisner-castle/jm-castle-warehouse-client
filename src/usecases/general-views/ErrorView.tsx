import { Grid, Paper } from "@mui/material";
import { AppAction } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { TextComponent } from "../../components/TextComponent";
import { ViewFrame } from "../../components/usecase/ViewFrame";

export interface ErrorViewProps {
  description: string;
  actions: AppAction[];
  errorData: Record<string, ErrorData>;
}

export const ErrorView = (props: ErrorViewProps) => {
  const { description, errorData, actions } = props;

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
                <ErrorDisplays results={errorData} />
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </ViewFrame>
  );
};

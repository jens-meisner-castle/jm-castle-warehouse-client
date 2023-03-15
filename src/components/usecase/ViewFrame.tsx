import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { PropsWithChildren } from "react";

export type ViewFrameProps = {
  description: string;
  actions: AppAction[];
} & PropsWithChildren;

export const ViewFrame = (props: ViewFrameProps) => {
  const { description, actions, children } = props;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{description}</Typography>
      </Grid>
      <Grid item>{children}</Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

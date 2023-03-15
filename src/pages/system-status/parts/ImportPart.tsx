import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useMemo } from "react";
import { allRoutes } from "../../../navigation/AppRoutes";

export const ImportPart = () => {
  const actions = useMemo(() => {
    const routes = allRoutes();
    const newActions: AppAction[] = [];
    newActions.push({
      label: "System importieren",
      onClickNavigate: { to: routes.systemImport.path },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Import`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

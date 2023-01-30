import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../components/AppActions";
import { allRoutes } from "../../../navigation/AppRoutes";

export const ExportPart = () => {
  const actions = useMemo(() => {
    const routes = allRoutes();
    const newActions: AppAction[] = [];
    newActions.push({
      label: "System exportieren",
      onClickNavigate: { to: routes.systemExport.path },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Export`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

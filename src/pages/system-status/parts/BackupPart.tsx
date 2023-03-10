import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../components/AppActions";
import { allRoutes } from "../../../navigation/AppRoutes";

export const BackupPart = () => {
  const actions = useMemo(() => {
    const routes = allRoutes();
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Backup erstellen",
      onClickNavigate: { to: routes.systemBackup.path },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Backup`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

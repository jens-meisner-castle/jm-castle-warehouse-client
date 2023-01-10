import { Grid, Typography } from "@mui/material";
import { Row_Emission } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface EmissionsProps {
  emissions: Row_Emission[];
}

export const Emissions = (props: EmissionsProps) => {
  const { emissions } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/stock/emission" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/stock/emission?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Ausgänge (${emissions.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

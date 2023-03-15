import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useMemo } from "react";

export interface CostunitsProps {
  count: number;
}

export const Costunits = (props: CostunitsProps) => {
  const { count } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/costunit" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/costunit?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Kostenstellen (${count})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

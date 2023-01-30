import { Grid, Typography } from "@mui/material";
import { Row_Costunit } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface CostunitsProps {
  costunits: Row_Costunit[];
}

export const Costunits = (props: CostunitsProps) => {
  const { costunits } = props;
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
        <Typography>{`Kostenstellen (${costunits.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

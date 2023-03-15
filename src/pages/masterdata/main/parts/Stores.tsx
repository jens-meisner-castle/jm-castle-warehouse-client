import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useMemo } from "react";

export interface StoresProps {
  count: number;
}

export const Stores = (props: StoresProps) => {
  const { count } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/store" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/store?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Lager (${count})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

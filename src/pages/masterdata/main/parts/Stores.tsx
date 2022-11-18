import { Grid, Typography } from "@mui/material";
import { Row_Store } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface StoresProps {
  stores: Row_Store[];
}

export const Stores = (props: StoresProps) => {
  const { stores } = props;
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
        <Typography>{`Lager (${stores.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

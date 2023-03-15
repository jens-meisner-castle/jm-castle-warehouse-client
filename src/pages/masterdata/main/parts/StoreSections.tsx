import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useMemo } from "react";

export interface StoreSectionsProps {
  count: number;
}

export const StoreSections = (props: StoreSectionsProps) => {
  const { count } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/store-section" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/store-section?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Lagerbereiche (${count})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

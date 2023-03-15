import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useMemo } from "react";

export interface ManufacturersProps {
  count: number;
}

export const Manufacturers = (props: ManufacturersProps) => {
  const { count } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/manufacturer" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/manufacturer?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Hersteller (${count})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

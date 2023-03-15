import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useMemo } from "react";

export interface ReceiversProps {
  count: number;
}

export const Receivers = (props: ReceiversProps) => {
  const { count } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/receiver" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/receiver?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Empfänger (${count})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

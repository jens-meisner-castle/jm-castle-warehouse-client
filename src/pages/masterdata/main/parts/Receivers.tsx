import { Grid, Typography } from "@mui/material";
import { Row_Receiver } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface ReceiversProps {
  receivers: Row_Receiver[];
}

export const Receivers = (props: ReceiversProps) => {
  const { receivers } = props;
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
        <Typography>{`Empfänger (${receivers.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

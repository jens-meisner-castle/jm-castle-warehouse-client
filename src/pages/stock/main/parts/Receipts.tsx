import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { Row_Receipt } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";

export interface ReceiptsProps {
  receipts: Row_Receipt[];
}

export const Receipts = (props: ReceiptsProps) => {
  const { receipts } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/stock/receipt" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/stock/receipt?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Eingänge (${receipts.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

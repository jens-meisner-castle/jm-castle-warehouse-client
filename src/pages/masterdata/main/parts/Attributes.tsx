import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface AttributesProps {
  count: number;
}

export const Attributes = (props: AttributesProps) => {
  const { count } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/attribute" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/attribute?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Attribute (${count})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

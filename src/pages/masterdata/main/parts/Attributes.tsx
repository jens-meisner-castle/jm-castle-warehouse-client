import { Grid, Typography } from "@mui/material";
import { Row_Attribute } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface AttributesProps {
  attributes: Row_Attribute[];
}

export const Attributes = (props: AttributesProps) => {
  const { attributes } = props;
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
        <Typography>{`Attribute (${attributes.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

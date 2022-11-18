import { Grid, Typography } from "@mui/material";
import { Row_StoreSection } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface StoreSectionsProps {
  sections: Row_StoreSection[];
}

export const StoreSections = (props: StoreSectionsProps) => {
  const { sections } = props;
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
        <Typography>{`Lagerbereiche (${sections.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

import { Grid, Typography } from "@mui/material";
import { Row_Manufacturer } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface ManufacturersProps {
  manufacturers: Row_Manufacturer[];
}

export const Manufacturers = (props: ManufacturersProps) => {
  const { manufacturers } = props;
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
        <Typography>{`Hersteller (${manufacturers.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

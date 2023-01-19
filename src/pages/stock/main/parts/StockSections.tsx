import { Grid, Typography } from "@mui/material";
import { SectionStockState } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface StockSectionsProps {
  stock: Record<string, SectionStockState>;
}

export const StockSections = (props: StockSectionsProps) => {
  const { stock } = props;

  const stockSections = useMemo(() => {
    return Object.keys(stock).map((sectionId) => stock[sectionId]);
  }, [stock]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Artikel",
      onClickNavigate: { to: "/stock/article" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Lagerbereiche (${stockSections.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

import { Grid, Typography } from "@mui/material";
import { SectionStockState } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";
import { allRoutes } from "../../../../navigation/AppRoutes";

export interface StockSectionsProps {
  stock: Record<string, SectionStockState>;
}

export const StockSections = (props: StockSectionsProps) => {
  const { stock } = props;

  const stockSections = useMemo(() => {
    return Object.keys(stock).map((sectionId) => stock[sectionId]);
  }, [stock]);

  const actions = useMemo(() => {
    const routes = allRoutes();
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Artikel",
      onClickNavigate: { to: routes.stockArticle.path },
    });
    /** Datenmengen werden zu groß! const values: string[][] = [];
    values.push(["action", "show"]);
    stockSections.forEach(
      (state) =>
        state.states.find(
          (d) => d.physicalCount !== 0 || d.availableCount !== 0
        ) && values.push(["sectionId", state.section.section_id])
    );
    const searchParams = new URLSearchParams(values);
    newActions.push({
      label: "Lagerbereich Inhalt",
      onClickNavigate: {
        to: `${routes.stockSectionDetail.path}?${searchParams.toString()}`,
      },
    }); */
    newActions.push({
      label: "Lagerbereich Inhalt",
      onClickNavigate: {
        to: `${routes.stockSectionDetail.path}`,
      },
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

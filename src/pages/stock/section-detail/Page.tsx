import { Print, Refresh } from "@mui/icons-material";
import { Grid, Paper, Typography } from "@mui/material";
import { SectionStockState } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppActionFilter } from "../../../app-action/useAppActionFilter";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { SectionStockStateComponent } from "../../../components/SectionStockStateComponent";
import { SizeVariant } from "../../../components/SizeVariant";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useStockSectionAll } from "../../../hooks/useStockSectionAll";
import { useUrlSearchParameters } from "../../../hooks/useUrlSearchParameters";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  ArticleRow,
  fromRawStoreSection,
  StoreSectionRow,
} from "../../../types/RowTypes";
import { PrintSectionLabelDialog } from "./parts/PrintSectionLabelDialog";

const filterTest: FilterTest<SectionStockState> = {
  storeSections: [],
};

const filterAspects = [
  ...Object.keys(filterTest),
  "nameFragment",
] as FilterAspect[];

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 800) return "tiny";
  if (width < 1000) return "small";
  if (width < 1200) return "medium";
  return "large";
};

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const { width } = useWindowSize() || {};
  const sizeVariant = width ? sizeVariantForWidth(width) : "tiny";
  const navigate = useNavigate();
  const { params: searchParams } = useUrlSearchParameters();
  const { sectionId: initialSectionIds, action: actionArr } =
    searchParams || {};

  const initialAction = actionArr?.length
    ? actionArr[0]
    : initialSectionIds?.length
    ? "show"
    : undefined;

  const { filter, handleFilterChange } = useArbitraryFilter({}, filterTest);

  useEffect(() => {
    switch (initialAction) {
      case "show":
        if (initialSectionIds?.length) {
          handleFilterChange({ storeSections: initialSectionIds });
          navigate(allRoutes().stockSectionDetail.path, { replace: true });
        }
        break;
      default:
        return;
    }
  }, [initialAction, handleFilterChange, initialSectionIds, navigate]);

  const { isFilterVisible, filterAction } = useAppActionFilter(false);

  const handleExpiredToken = useHandleExpiredToken();

  const stockApiResponse = useStockSectionAll(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: stock } = stockApiResponse;

  const { storeSections } = filter;

  const selectedStockStates = useMemo(() => {
    const newStates: SectionStockState[] = [];
    const { nameFragment } = filter;
    const nameRegex = nameFragment ? new RegExp(nameFragment, "i") : undefined;
    if (stock) {
      storeSections?.forEach((sectionId) => {
        const state = stock[sectionId];
        const passFilter =
          !nameRegex ||
          state.states.find(
            (d) =>
              d.article.article_id.match(nameRegex) ||
              d.article.name.match(nameRegex)
          );
        state && passFilter && newStates.push(state);
      });
    }
    return newStates;
  }, [storeSections, filter, stock]);

  const selectedSections = useMemo(() => {
    return selectedStockStates.map((state) =>
      fromRawStoreSection(state.section)
    );
  }, [selectedStockStates]);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.stock = stockApiResponse;
    return newData;
  }, [stockApiResponse]);

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <Refresh />,
      tooltip: "Daten aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push(filterAction);
    newActions.push({
      label: <Print />,
      tooltip: "Etikett drucken",
      disabled: !selectedStockStates.length,
      onClick: () => setIsPrintDialogOpen((previous) => !previous),
    });
    return newActions;
  }, [refreshStatus, filterAction, selectedStockStates]);

  const handleAddToSection = useCallback(
    (section: StoreSectionRow) => {
      const searchParams = new URLSearchParams({
        action: "new",
        sectionId: section.sectionId,
      });
      navigate(`${allRoutes().stockReceipt.path}?${searchParams.toString()}`);
    },
    [navigate]
  );

  const handleMoveArticle = useCallback(
    (article: ArticleRow, section: StoreSectionRow) => {
      const searchParams = new URLSearchParams({
        usecase: "relocate",
        articleId: article.articleId,
        sectionId: section.sectionId,
      });
      navigate(`${allRoutes().usecase.path}?${searchParams.toString()}`);
    },
    [navigate]
  );

  const handleEmitArticle = useCallback(
    (article: ArticleRow, section: StoreSectionRow) => {
      const searchParams = new URLSearchParams({
        action: "new",
        articleId: article.articleId,
        sectionId: section.sectionId,
      });
      navigate(`${allRoutes().stockEmission.path}?${searchParams.toString()}`);
    },
    [navigate]
  );

  return (
    <Grid container direction="column">
      {isPrintDialogOpen && (
        <PrintSectionLabelDialog
          sections={selectedSections}
          onClose={() => setIsPrintDialogOpen(false)}
        />
      )}
      <Grid item>
        <Typography variant="h5">{"Lagerbereichbestand"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      {isFilterVisible && (
        <Grid item>
          <Paper style={{ marginBottom: 5, padding: 5 }}>
            <ArbitraryFilterComponent
              filter={filter}
              aspects={filterAspects}
              onChange={handleFilterChange}
              helpNameFragment={
                "Sucht in der Artikel ID und im Namen des Artikels."
              }
              handleExpiredToken={handleExpiredToken}
            />
          </Paper>
        </Grid>
      )}
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        {selectedStockStates.map((state, i) => (
          <Paper
            key={state.section.section_id}
            style={{ padding: 5, marginTop: i > 0 ? 5 : 0 }}
          >
            <SectionStockStateComponent
              key={state.section.section_id}
              stockState={state}
              sizeVariant={sizeVariant}
              onAddToSection={handleAddToSection}
              onAddToSectionHelp={"Neuer Wareneingang"}
              onMoveArticle={handleMoveArticle}
              onMoveArticleHelp={"Artikel umlagern"}
              onEmitArticle={handleEmitArticle}
              onEmitArticleHelp={"Artikel ausgeben"}
            />
          </Paper>
        ))}
      </Grid>
    </Grid>
  );
};

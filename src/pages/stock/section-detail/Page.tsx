import { FilterAlt, FilterAltOff, Print, Refresh } from "@mui/icons-material";
import { Grid, Paper, Typography } from "@mui/material";
import { SectionStockState } from "jm-castle-warehouse-types/build";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { SectionStockStateComponent } from "../../../components/SectionStockStateComponent";
import { backendApiUrl } from "../../../configuration/Urls";
import {
  ArbitraryFilterComponent,
  FilterAspect,
} from "../../../filter/ArbitraryFilterComponent";
import { ArbitraryFilter } from "../../../filter/Types";
import { useStockSectionAll } from "../../../hooks/useStockSectionAll";
import { useUrlSearchParameters } from "../../../hooks/useUrlSearchParameters";
import { allRoutes } from "../../../navigation/AppRoutes";
import { fromRawStoreSection, StoreSectionRow } from "../../../types/RowTypes";
import { PrintSectionLabelDialog } from "./parts/PrintSectionLabelDialog";

const filterAspects: FilterAspect[] = ["storeSection"];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { params: urlParameters } = useUrlSearchParameters();
  const { sectionId: sectionIds } = urlParameters || { sectionId: [] };
  const [filter, setFilter] = useState<ArbitraryFilter>({
    sectionIds,
  });

  const [isFilterComponentVisible, setIsFilterComponentVisible] =
    useState(false);

  const handleFilterChange = useCallback(
    (changes: Partial<ArbitraryFilter>) => {
      setFilter((previous) => {
        const newFilter = { ...previous, ...changes };
        return Object.keys(newFilter).find(
          (k) => newFilter[k as keyof typeof newFilter]
        )
          ? newFilter
          : {};
      });
    },
    []
  );

  const handleHideFilterComponent = useCallback(
    () => setIsFilterComponentVisible(false),
    []
  );
  const handleShowFilterComponent = useCallback(
    () => setIsFilterComponentVisible(true),
    []
  );

  const handleExpiredToken = useHandleExpiredToken();

  const stockApiResponse = useStockSectionAll(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: stock } = stockApiResponse;

  const selectedStockStates = useMemo(() => {
    const newStates: SectionStockState[] = [];
    if (stock) {
      sectionIds.forEach((sectionId) => {
        const state = stock[sectionId];
        state && newStates.push(state);
      });
    }
    return newStates;
  }, [sectionIds, stock]);

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
    newActions.push({
      label: isFilterComponentVisible ? <FilterAltOff /> : <FilterAlt />,
      tooltip: isFilterComponentVisible
        ? "Filter ausblenden"
        : "Filter einblenden",
      onClick: isFilterComponentVisible
        ? handleHideFilterComponent
        : handleShowFilterComponent,
    });
    newActions.push({
      label: <Print />,
      tooltip: "Etikett drucken",
      disabled: !selectedStockStates.length,
      onClick: () => setIsPrintDialogOpen((previous) => !previous),
    });
    return newActions;
  }, [
    refreshStatus,
    isFilterComponentVisible,
    handleHideFilterComponent,
    handleShowFilterComponent,
    selectedStockStates,
  ]);

  const onAddToSection = useCallback(
    (section: StoreSectionRow) => {
      const searchParams = new URLSearchParams({
        action: "new",
        sectionId: section.sectionId,
      });
      navigate(`${allRoutes().stockReceipt.path}?${searchParams.toString()}`);
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
      {isFilterComponentVisible && (
        <Grid item>
          <Paper style={{ marginBottom: 5, padding: 5 }}>
            <ArbitraryFilterComponent
              filter={filter}
              aspects={filterAspects}
              onChange={handleFilterChange}
              helpNameFragment={"Sucht in der Artikel ID und im Namen."}
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
              onAddToSection={onAddToSection}
            />
          </Paper>
        ))}
      </Grid>
    </Grid>
  );
};

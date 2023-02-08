import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import {
  sizeVariantForWidth,
  StockChangeTable,
} from "../../components/table/StockChangeTable";
import { backendApiUrl } from "../../configuration/Urls";
import { TimeFilterComponent } from "../../filter/TimeFilterComponent";
import { TimeintervalFilter } from "../../filter/Types";
import { useEmissionSelect } from "../../hooks/useEmissionSelect";
import { useReceiptSelectByInterval } from "../../hooks/useReceiptSelectByInterval";
import { useWindowSize } from "../../hooks/useWindowSize";
import { allRoutes } from "../../navigation/AppRoutes";
import {
  StockChangingRow,
  stockChangingRowFromRawEmission,
  stockChangingRowFromRawReceipt,
} from "../../types/RowTypes";
import { getNewFilter } from "../../utils/Filter";
import {
  loadFilterForPage,
  loadOptionsForPage,
  storeFilterForPage,
  storeOptionsForPage,
} from "../../utils/LocalStorage";
import { getNewOptions, PageOptions } from "./parts/OptionsComponent";
import { OptionsMenu } from "./parts/OptionsMenu";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [pageOptions, setPageOptions] = useState(
    getNewOptions(loadOptionsForPage(allRoutes().history.path) || {})
  );
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const handleNewOptions = useCallback((newOptions: Partial<PageOptions>) => {
    let mergedOptions: PageOptions | Partial<PageOptions> = {};
    setPageOptions((previous) => {
      mergedOptions = { ...previous, ...newOptions };
      return { ...previous, ...newOptions };
    });
    mergedOptions &&
      storeOptionsForPage(mergedOptions, allRoutes().history.path);
  }, []);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsSelectionRef = useRef<HTMLButtonElement | null>(null);

  const initialFilter = useMemo(
    () => getNewFilter(loadFilterForPage(allRoutes().history.path)),
    []
  );
  const [filter, setFilter] = useState<TimeintervalFilter>(initialFilter);
  const [isFilterComponentVisible, setIsFilterComponentVisible] =
    useState(false);
  const handleHideFilterComponent = useCallback(
    () => setIsFilterComponentVisible(false),
    []
  );
  const handleShowFilterComponent = useCallback(
    () => setIsFilterComponentVisible(true),
    []
  );

  const handleFilterChange = useCallback((newFilter: TimeintervalFilter) => {
    storeFilterForPage(newFilter, allRoutes().history.path);
    setFilter(newFilter);
  }, []);

  const [updateIndicator, setUpdateIndicator] = useState(1);

  const receiptApiResponse = useReceiptSelectByInterval(
    backendApiUrl,
    filter.from,
    filter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: receiptResponse } = receiptApiResponse;

  const emissionApiResponse = useEmissionSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: emissionResponse } = emissionApiResponse;
  const { result: emissionResult } = emissionResponse || {};
  const { result: receiptResult } = receiptResponse || {};
  const { rows: receiptRows } = receiptResult || {};
  const { rows: emissionRows } = emissionResult || {};
  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.receipt = receiptApiResponse;
    newData.emission = emissionApiResponse;
    return newData;
  }, [receiptApiResponse, emissionApiResponse]);
  const { tableData } = useMemo(() => {
    const newTableData: StockChangingRow[] = [];
    receiptRows?.forEach((row) => {
      newTableData.push(stockChangingRowFromRawReceipt(row));
    });
    emissionRows?.forEach((row) => {
      newTableData.push(stockChangingRowFromRawEmission(row));
    });
    newTableData.sort((a, b) =>
      a.at === b.at
        ? a.articleId.localeCompare(b.articleId)
        : a.at.getTime() - b.at.getTime()
    );
    return {
      tableData: newTableData,
    };
  }, [emissionRows, receiptRows]);

  const refresh = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: (
        <Tooltip title="Daten aktualisieren">
          <RefreshIcon />
        </Tooltip>
      ),
      onClick: refresh,
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
      label: <SettingsApplicationsIcon />,
      onClick: () => setIsOptionsVisible((previous) => !previous),
      elementRef: optionsSelectionRef,
    });
    return newActions;
  }, [
    refresh,
    handleHideFilterComponent,
    handleShowFilterComponent,
    isFilterComponentVisible,
  ]);

  return (
    <>
      {isOptionsVisible && (
        <OptionsMenu
          options={pageOptions}
          onChange={handleNewOptions}
          onClose={() => setIsOptionsVisible(false)}
          anchorEl={optionsSelectionRef.current}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"History"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        {isFilterComponentVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5 }}>
              <TimeFilterComponent
                filter={filter}
                onChange={handleFilterChange}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        <Grid item>
          <StockChangeTable
            data={tableData}
            sizeVariant={tableSize}
            containerStyle={{ width: "100%", maxWidth: 1200 }}
          />
        </Grid>
      </Grid>
    </>
  );
};

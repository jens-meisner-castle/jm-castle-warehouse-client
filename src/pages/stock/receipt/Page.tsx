import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useHandleExpiredToken,
  useVerifiedUser,
} from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import {
  ReceiptsTable,
  sizeVariantForWidth,
} from "../../../components/table/ReceiptsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeFilterComponent } from "../../../filter/TimeFilterComponent";
import { TimeintervalFilter } from "../../../filter/Types";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useCostunitSelect } from "../../../hooks/useCostunitSelect";
import { useReceiptInsert } from "../../../hooks/useReceiptInsert";
import { useReceiptSelect } from "../../../hooks/useReceiptSelect";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  ArticleRow,
  compareReceiptRow,
  CostunitRow,
  fromRawArticle,
  fromRawCostunit,
  fromRawReceipt,
  fromRawStoreSection,
  ReceiptRow,
  StoreSectionRow,
  toRawReceipt,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import { getNewFilter } from "../../../utils/Filter";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateReceiptDialog } from "./dialogs/CreateReceiptDialog";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<ReceiptRow>[]>([
    { field: "receiptAt", direction: "descending" },
  ]);
  const [filter, setFilter] = useState<TimeintervalFilter>(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }),
      to: DateTime.now().endOf("day"),
    })
  );
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
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const displayImage = tableSize === "tiny" ? "none" : "small";
  const handleFilterChange = useCallback((newFilter: TimeintervalFilter) => {
    setFilter(newFilter);
  }, []);
  const handleExpiredToken = useHandleExpiredToken();
  const { username } = useVerifiedUser() || {};
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().stockReceipt.path, { replace: true }),
    [initialAction, navigate]
  );

  const receiptApiResponse = useReceiptSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: receiptResponse } = receiptApiResponse;
  const { result: receiptResult } = receiptResponse || {};
  const receiptRows = useMemo(() => {
    if (receiptResult) {
      const newRows: ReceiptRow[] = [];
      receiptResult.rows.forEach((r) => {
        const newRow = fromRawReceipt(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.receiptAt.getTime() - b.receiptAt.getTime());
      return newRows;
    }
    return undefined;
  }, [receiptResult]);

  const filteredOrderedRows = useMemo(() => {
    if (!receiptRows) return undefined;
    const filtered = [...receiptRows]; //.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<ReceiptRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareReceiptRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [receiptRows, order]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<ReceiptRow>,
    ReducerState<ReceiptRow>
  >(
    ActionStateReducer<ReceiptRow>,
    { action: "none", data: undefined },
    () => ({ action: "none", data: undefined })
  );

  const articleApiResponse = useArticleSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const articleRows = useMemo(() => {
    const newRows: ArticleRow[] = [];
    const { rows } = articleResult || {};
    rows?.forEach((raw) => newRows.push(fromRawArticle(raw)));
    return newRows;
  }, [articleResult]);

  const sectionsApiResponse = useStoreSectionSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: sectionsResponse } = sectionsApiResponse;
  const { result: sectionsResult } = sectionsResponse || {};
  const sectionRows = useMemo(() => {
    const newRows: StoreSectionRow[] = [];
    const { rows } = sectionsResult || {};
    rows?.forEach((raw) => newRows.push(fromRawStoreSection(raw)));
    return newRows;
  }, [sectionsResult]);

  const costunitsApiResponse = useCostunitSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: costunitsResponse } = costunitsApiResponse;
  const { result: costunitsResult } = costunitsResponse || {};
  const costunitRows = useMemo(() => {
    const newRows: CostunitRow[] = [];
    const { rows } = costunitsResult || {};
    rows?.forEach((raw) => newRows.push(fromRawCostunit(raw)));
    return newRows;
  }, [costunitsResult]);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.storeSection = sectionsApiResponse;
    newData.emission = receiptApiResponse;
    return newData;
  }, [sectionsApiResponse, receiptApiResponse]);

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && receiptRows) {
      switch (initialAction) {
        case "new": {
          const { sectionId, articleId } = params || {};
          dispatch({
            type: "new",
            data: {
              datasetId: "new",
              sectionId: sectionId || "",
              byUser: username || "",
              articleId: articleId || "",
              articleCount: 1,
              imageRefs: undefined,
              wwwLink: undefined,
              receiptAt: new Date(),
              guarantyTo: undefined,
              reason: "buy",
              costUnit: "",
              price: undefined,
            },
          });
          break;
        }
        case "duplicate":
          {
            const datasetId = params?.datasetId;
            const datasetNumber = datasetId
              ? Number.parseInt(datasetId)
              : undefined;
            const data = datasetId
              ? receiptRows.find((row) => row.datasetId === datasetNumber)
              : undefined;
            data &&
              dispatch({
                type: "new",
                data: {
                  ...data,
                  datasetId: "new",
                  byUser: username || "",
                  receiptAt: new Date(),
                },
              });
          }
          break;
      }
    }
  }, [initialAction, params, receiptRows, username]);
  const handleDuplicate = useCallback(
    (row: ReceiptRow) => {
      navigate(
        `${allRoutes().stockReceipt.path}?action=duplicate&datasetId=${
          row.datasetId
        }`
      );
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);

  const handleAccept = useCallback(
    (data: ReceiptRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawReceipt(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);

  const { response: insertResponse, error: insertError } = useReceiptInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (
        dataToInsert.article_id === resultData.article_id &&
        dataToInsert.receipt_at === resultData.receipt_at
      ) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawReceipt(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawReceipt(dataToInsert),
        error: insertError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
      refreshStatus();
    }
  }, [
    dataToInsert,
    insertResult,
    insertError,
    resetInitialAction,
    refreshStatus,
  ]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
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
      label: (
        <Tooltip title="Neuen Datensatz anlegen">
          <AddBoxIcon />
        </Tooltip>
      ),
      onClick: () => navigate(`${allRoutes().stockReceipt.path}?action=new`),
    });
    return newActions;
  }, [
    refreshStatus,
    handleHideFilterComponent,
    handleShowFilterComponent,
    isFilterComponentVisible,
    navigate,
  ]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Eingang <${actionState.previous?.data.datasetId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateReceiptDialog
          receipt={actionState.data}
          articles={articleRows}
          storeSections={sectionRows}
          costunits={costunitRows}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Wareneingang"}</Typography>
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
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <ReceiptsTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable
                  displayImage={displayImage}
                  data={filteredOrderedRows || []}
                  order={order}
                  onOrderChange={setOrder}
                  onDuplicate={handleDuplicate}
                  sizeVariant={tableSize}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

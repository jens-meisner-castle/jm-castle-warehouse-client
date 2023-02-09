import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppActionEdit } from "../../../app-action/useAppActionEdit";
import { useAppActionFilter } from "../../../app-action/useAppActionFilter";
import {
  useHandleExpiredToken,
  useVerifiedUser,
} from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { FilteredRowsDisplay } from "../../../components/FilteredRowsDisplay";
import {
  ReceiptsTable,
  sizeVariantForWidth,
} from "../../../components/table/ReceiptsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { TimeFilterComponent } from "../../../filter/TimeFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useTimeintervalFilter } from "../../../filter/useTimeintervalFilter";
import { useMasterdata } from "../../../hooks/useMasterdata";
import { useReceiptInsert } from "../../../hooks/useReceiptInsert";
import { useReceiptSelectByInterval } from "../../../hooks/useReceiptSelectByInterval";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareReceiptRow,
  fromRawReceipt,
  ReceiptRow,
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

const filterTest: FilterTest<ReceiptRow> = {
  nameFragment: ["articleId"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<ReceiptRow>[]>([
    { field: "receiptAt", direction: "descending" },
  ]);
  const { timeFilter, handleTimeFilterChange } = useTimeintervalFilter(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }),
      to: DateTime.now().endOf("day"),
    })
  );

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const { isFilterVisible, filterAction } = useAppActionFilter(false);

  const { isEditActive, setIsEditActive, editAction } = useAppActionEdit(false);

  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const displayImage = tableSize === "tiny" ? "none" : "small";

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

  const receiptApiResponse = useReceiptSelectByInterval(
    backendApiUrl,
    timeFilter.from,
    timeFilter.to,
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
      return newRows;
    }
    return undefined;
  }, [receiptResult]);

  const filteredOrderedRows = useMemo(() => {
    if (!receiptRows) return undefined;
    const filtered = receiptRows.filter((row) => passFilter(row));
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
  }, [receiptRows, passFilter, order]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<ReceiptRow>,
    ReducerState<ReceiptRow>
  >(
    ActionStateReducer<ReceiptRow>,
    { action: "none", data: undefined },
    () => ({ action: "none", data: undefined })
  );

  const { rows, errors } = useMasterdata(
    backendApiUrl,
    { article: true, costunit: true, section: true },
    1,
    handleExpiredToken
  );
  const { articleRows, costunitRows, sectionRows } = rows;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = { ...errors };
    newData.receipt = receiptApiResponse;
    return newData;
  }, [errors, receiptApiResponse]);

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
          setIsEditActive(true);
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
              reason: "inventory",
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
            if (data) {
              setIsEditActive(true);
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
          }
          break;
      }
    }
  }, [initialAction, setIsEditActive, params, receiptRows, username]);
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
    newActions.push(filterAction);
    newActions.push(editAction);
    isEditActive &&
      newActions.push({
        label: <AddBoxIcon />,
        tooltip: "Neuen Datensatz anlegen",
        onClick: () => navigate(`${allRoutes().stockReceipt.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Eingang <${actionState.previous?.data.datasetId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" &&
        actionState.data &&
        articleRows &&
        sectionRows &&
        costunitRows && (
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
        {isFilterVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5 }}>
              <TimeFilterComponent
                filter={timeFilter}
                onChange={handleTimeFilterChange}
              />
            </Paper>
          </Grid>
        )}
        {isFilterVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5, padding: 5 }}>
              <ArbitraryFilterComponent
                filter={filter}
                onChange={handleFilterChange}
                aspects={filterAspects}
                helpNameFragment={"Sucht in der Artikel ID."}
                handleExpiredToken={handleExpiredToken}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <FilteredRowsDisplay
            all={receiptRows}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <ReceiptsTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable={isEditActive}
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

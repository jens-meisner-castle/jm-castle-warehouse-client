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
  EmissionsTable,
  sizeVariantForWidth,
} from "../../../components/table/EmissionsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { TimeFilterComponent } from "../../../filter/TimeFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useTimeintervalFilter } from "../../../filter/useTimeintervalFilter";
import { useEmissionInsert } from "../../../hooks/useEmissionInsert";
import { useEmissionSelect } from "../../../hooks/useEmissionSelect";
import { useMasterdata } from "../../../hooks/pagination/useMasterdata";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareEmissionRow,
  EmissionRow,
  fromRawEmission,
  toRawEmission,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import { getNewFilter } from "../../../utils/Filter";
import { ActionStateReducer, getValidInitialAction } from "../utils/Reducer";
import { CreateEmissionDialog } from "./dialogs/CreateEmissionDialog";

const filterTest: FilterTest<EmissionRow> = {
  nameFragment: ["articleId"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<EmissionRow>[]>([
    { field: "emittedAt", direction: "descending" },
  ]);

  const { isFilterVisible, filterAction } = useAppActionFilter(false);

  const { isEditActive, setIsEditActive, editAction } = useAppActionEdit(false);

  const { timeFilter, handleTimeFilterChange } = useTimeintervalFilter(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }).startOf("day"),
      to: DateTime.now().endOf("day"),
    })
  );

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const handleExpiredToken = useHandleExpiredToken();
  const { username } = useVerifiedUser() || {};
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().stockEmission.path, { replace: true }),
    [initialAction, navigate]
  );

  const emissionApiResponse = useEmissionSelect(
    backendApiUrl,
    timeFilter.from,
    timeFilter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: emissionResponse } = emissionApiResponse;
  const { result: emissionResult } = emissionResponse || {};
  const emissionRows = useMemo(() => {
    if (emissionResult) {
      const newRows: EmissionRow[] = [];
      emissionResult.rows.forEach((r) => {
        const newRow = fromRawEmission(r);
        newRows.push(newRow);
      });
      return newRows;
    }
    return undefined;
  }, [emissionResult]);

  const filteredOrderedRows = useMemo(() => {
    if (!emissionRows) return undefined;
    const filtered = emissionRows.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<EmissionRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareEmissionRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [emissionRows, passFilter, order]);

  const [actionState, dispatch] = useReducer(ActionStateReducer<EmissionRow>, {
    action: "none",
    data: undefined,
  });

  const { rows, errors } = useMasterdata(
    backendApiUrl,
    { article: true, receiver: true, costunit: true, section: true },
    1,
    handleExpiredToken
  );
  const { articleRows, receiverRows, costunitRows, sectionRows } = rows;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = { ...errors };
    newData.emission = emissionApiResponse;
    return newData;
  }, [emissionApiResponse, errors]);

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && emissionRows) {
      switch (initialAction) {
        case "new":
          {
            setIsEditActive(true);
            const { sectionId, articleId } = params || {};
            dispatch({
              type: "new",
              data: {
                datasetId: "new",
                sectionId: sectionId || "",
                byUser: username || "",
                articleId: articleId || "",
                articleCount: 1,
                emittedAt: new Date(),
                reason: "loan",
                receiver: "",
                costUnit: "",
                imageRefs: undefined,
                price: undefined,
              },
            });
          }
          break;
        case "duplicate":
          {
            const datasetId = params?.datasetId;
            const datasetNumber = datasetId
              ? Number.parseInt(datasetId)
              : undefined;
            const data = datasetId
              ? emissionRows.find((row) => row.datasetId === datasetNumber)
              : undefined;
            if (data) {
              setIsEditActive(true);
              dispatch({
                type: "new",
                data: {
                  ...data,
                  datasetId: "new",
                  byUser: username || "",
                  emittedAt: new Date(),
                },
              });
            }
          }
          break;
      }
    }
  }, [initialAction, setIsEditActive, params, emissionRows, username]);
  const handleDuplicate = useCallback(
    (row: EmissionRow) => {
      navigate(
        `${allRoutes().stockEmission.path}?action=duplicate&datasetId=${
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
    (data: EmissionRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawEmission(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);

  const { response: insertResponse, error: insertError } = useEmissionInsert(
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
        dataToInsert.emitted_at === resultData.emitted_at
      ) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawEmission(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawEmission(dataToInsert),
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
        onClick: () => navigate(`${allRoutes().stockEmission.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Ausgang <${actionState.previous?.data.datasetId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" &&
        actionState.data &&
        articleRows &&
        costunitRows &&
        receiverRows &&
        sectionRows && (
          <CreateEmissionDialog
            receipt={actionState.data}
            articles={articleRows}
            receivers={receiverRows}
            storeSections={sectionRows}
            costunits={costunitRows}
            open={true}
            handleCancel={handleCancel}
            handleAccept={handleAccept}
          />
        )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Warenausgang"}</Typography>
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
            all={emissionRows}
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
                <EmissionsTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable={isEditActive}
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

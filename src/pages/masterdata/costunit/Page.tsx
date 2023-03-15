import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppActionEdit } from "../../../app-action/useAppActionEdit";
import { useAppActionFilter } from "../../../app-action/useAppActionFilter";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { ErrorDisplays } from "../../../components/ErrorDisplays";
import { FilteredRowsDisplay } from "../../../components/FilteredRowsDisplay";
import {
  CostunitsTable,
  sizeVariantForWidth,
} from "../../../components/table/CostunitsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useMasterdata } from "../../../hooks/pagination/useMasterdata";
import { useCostunitInsert } from "../../../hooks/useCostunitInsert";
import { useCostunitUpdate } from "../../../hooks/useCostunitUpdate";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareCostunitRow,
  CostunitRow,
  fromRawCostunit,
  toRawCostunit,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import { getFilteredOrderedRows } from "../../../utils/Compare";
import { ActionStateReducer, getValidInitialAction } from "../utils/Reducer";
import { CreateCostunitDialog } from "./dialogs/CreateCostunitDialog";
import { EditCostunitDialog } from "./dialogs/EditCostunitDialog";

const filterTest: FilterTest<CostunitRow> = {
  nameFragment: ["unitId", "name"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<CostunitRow>[]>([
    { field: "unitId", direction: "ascending" },
  ]);

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const { isFilterVisible, filterAction } = useAppActionFilter(false);
  const { isEditActive, setIsEditActive, editAction } = useAppActionEdit(false);

  const handleExpiredToken = useHandleExpiredToken();
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataCostunit.path, { replace: true }),
    [initialAction, navigate]
  );

  const { rows, errors: errorData } = useMasterdata(
    backendApiUrl,
    { costunit: true },
    updateIndicator,
    handleExpiredToken
  );
  const { costunitRows } = rows;

  const filteredOrderedRows = useMemo(() => {
    return getFilteredOrderedRows(
      costunitRows,
      passFilter,
      order,
      compareCostunitRow
    );
  }, [costunitRows, passFilter, order]);

  const [actionState, dispatch] = useReducer(ActionStateReducer<CostunitRow>, {
    action: "none",
    data: undefined,
  });

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && costunitRows) {
      switch (initialAction) {
        case "new":
          {
            setIsEditActive(true);
            dispatch({
              type: "new",
              data: {
                unitId: "",
                name: "",
                datasetVersion: 1,
                createdAt: new Date(),
                editedAt: new Date(),
              },
            });
          }
          break;
        case "edit": {
          const unitId = params?.unitId;
          const row = unitId
            ? costunitRows.find((row) => row.unitId === unitId)
            : undefined;
          if (row) {
            setIsEditActive(true);
            dispatch({
              type: "edit",
              data: row,
            });
          }
          break;
        }
        case "duplicate":
          {
            const unitId = params?.unitId;
            const data = unitId
              ? costunitRows.find((row) => row.unitId === unitId)
              : undefined;
            if (data) {
              setIsEditActive(true);
              dispatch({
                type: "new",
                data: {
                  ...data,
                  datasetVersion: 1,
                  createdAt: new Date(),
                  editedAt: new Date(),
                },
              });
            }
          }
          break;
      }
    }
  }, [initialAction, setIsEditActive, params, costunitRows]);
  const handleEdit = useCallback(
    (row: CostunitRow) => {
      navigate(
        `${allRoutes().masterdataCostunit.path}?action=edit&unitId=${
          row.unitId
        }`
      );
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: CostunitRow) => {
      navigate(
        `${allRoutes().masterdataCostunit.path}?action=duplicate&unitId=${
          row.unitId
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
    (data: CostunitRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawCostunit(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToUpdate = toRawCostunit(data);
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } = useCostunitInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

  const { response: updateResponse, error: updateError } = useCostunitUpdate(
    backendApiUrl,
    dataToUpdate,
    dataToUpdate ? 1 : 0,
    handleExpiredToken
  );

  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.unit_id === resultData.unit_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawCostunit(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawCostunit(dataToInsert),
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

  useEffect(() => {
    const { data: resultData } = updateResult || {};
    if (dataToUpdate && resultData) {
      if (dataToUpdate.unit_id === resultData.unit_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawCostunit(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawCostunit(dataToUpdate),
        error: updateError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
      refreshStatus();
    }
  }, [
    dataToUpdate,
    updateResult,
    updateError,
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
        onClick: () =>
          navigate(`${allRoutes().masterdataCostunit.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Costunit <${actionState.previous?.data.unitId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateCostunitDialog
          hashtag={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditCostunitDialog
          hashtag={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Costunit"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        {isFilterVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5, padding: 5 }}>
              <ArbitraryFilterComponent
                filter={filter}
                onChange={handleFilterChange}
                aspects={filterAspects}
                helpNameFragment={"Sucht in der ID und im Namen."}
                handleExpiredToken={handleExpiredToken}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <FilteredRowsDisplay
            all={costunitRows}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <CostunitsTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable={isEditActive}
                  data={filteredOrderedRows || []}
                  order={order}
                  onOrderChange={setOrder}
                  onEdit={handleEdit}
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

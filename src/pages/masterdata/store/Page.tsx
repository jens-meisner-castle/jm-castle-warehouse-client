import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Grid,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppAction, AppActions } from "../../../components/AppActions";
import { StoresTable } from "../../../components/StoresTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useStoreInsert } from "../../../hooks/useStoreInsert";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import { useStoreUpdate } from "../../../hooks/useStoreUpdate";
import { fromRawStore, StoreRow, toRawStore } from "../../../types/RowTypes";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateStoreDialog } from "./dialogs/CreateStoreDialog";
import { EditStoreDialog } from "./dialogs/EditStoreDialog";

export const pageUrl = "/masterdata/store";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialAction = getValidInitialAction(params.get("action"));

  const resetInitialAction = useCallback(
    () => initialAction !== "none" && navigate(pageUrl),
    [initialAction, navigate]
  );

  const { response: selectResponse, error: selectError } = useStoreSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { result: selectResult } = selectResponse || {};
  const rows = useMemo(() => {
    if (selectResult) {
      const newRows: StoreRow[] = [];
      selectResult.rows.forEach((r) => {
        const newRow = fromRawStore(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [selectResult]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<StoreRow>,
    ReducerState<StoreRow>
  >(ActionStateReducer<StoreRow>, { action: "none", data: undefined }, () => ({
    action: "none",
    data: undefined,
  }));
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && rows) {
      switch (initialAction) {
        case "new":
          dispatch({
            type: "new",
            data: {
              storeId: "",
              name: "",
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
            },
          });
          break;
        case "edit": {
          const storeId = params.get("storeId");
          const data = storeId
            ? rows.find((row) => row.storeId === storeId)
            : undefined;
          data &&
            dispatch({
              type: "edit",
              data,
            });
          break;
        }
      }
    }
  }, [initialAction, params, rows]);
  const handleEdit = useCallback(
    (row: StoreRow) => {
      navigate(`${pageUrl}?action=edit&storeId=${row.storeId}`);
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);
  const handleAcceptNew = useCallback(
    (store: StoreRow) => dispatch({ type: "accept", data: store }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawStore(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToInsert = toRawStore(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } = useStoreInsert(
    backendApiUrl,
    dataToInsert,
    1
  );
  const { result: insertResult } = insertResponse || {};
  const { response: updateResponse, error: updateError } = useStoreUpdate(
    backendApiUrl,
    dataToUpdate,
    1
  );
  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.store_id === resultData.store_id) {
        // dann hat das Einfügen geklappt
        dispatch({ type: "success", data: fromRawStore(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawStore(dataToInsert),
        error: insertError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
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
      if (dataToUpdate.store_id === resultData.store_id) {
        // dann hat das Aktualisieren geklappt
        dispatch({ type: "success", data: fromRawStore(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawStore(dataToUpdate),
        error: updateError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
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
      label: (
        <Tooltip title="Daten aktualisieren">
          <RefreshIcon />
        </Tooltip>
      ),
      onClick: refreshStatus,
    });
    newActions.push({
      label: <AddBoxIcon />,
      onClick: () => navigate(`${pageUrl}?action=new`),
    });
    return newActions;
  }, [refreshStatus, navigate]);

  return (
    <>
      {actionState.action === "error-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler beim Speichern von Lager <${actionState.data.storeId}>. ${actionState.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "success-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Lager <${actionState.data.storeId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "error-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler beim Ändern von Lager <${actionState.data.storeId}>. ${actionState.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "success-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Lager <${actionState.data.storeId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "new" && actionState.data && (
        <CreateStoreDialog
          store={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditStoreDialog
          store={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Lager"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        {selectError && (
          <Grid item>
            <Paper>
              <Typography>{selectError}</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <StoresTable
                  editable
                  data={rows || []}
                  onEdit={handleEdit}
                  cellSize="medium"
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

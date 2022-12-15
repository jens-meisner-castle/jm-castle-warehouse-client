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
import { StoreSectionsTable } from "../../../components/StoreSectionsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useStoreSectionInsert } from "../../../hooks/useStoreSectionInsert";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useStoreSectionUpdate } from "../../../hooks/useStoreSectionUpdate";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import {
  fromRawStore,
  fromRawStoreSection,
  StoreRow,
  StoreSectionRow,
  toRawStoreSection,
} from "../../../types/RowTypes";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateStoreSectionDialog } from "./dialogs/CreateStoreSectionDialog";
import { EditStoreSectionDialog } from "./dialogs/EditStoreSectionDialog";

export const pageUrl = "/masterdata/store-section";

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

  const { response: selectResponse, error: selectError } =
    useStoreSectionSelect(backendApiUrl, "%", updateIndicator);
  const { result: selectResult } = selectResponse || {};
  const rows = useMemo(() => {
    if (selectResult) {
      const newRows: StoreSectionRow[] = [];
      selectResult.rows.forEach((r) => {
        const newRow = fromRawStoreSection(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [selectResult]);

  const { response: storeResponse, error: storeError } = useStoreSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { result: storeResult } = storeResponse || {};
  const storeRows = useMemo(() => {
    if (storeResult) {
      const newRows: StoreRow[] = [];
      storeResult.rows.forEach((r) => {
        const newRow = fromRawStore(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [storeResult]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<StoreSectionRow>,
    ReducerState<StoreSectionRow>
  >(
    ActionStateReducer<StoreSectionRow>,
    { action: "none", data: undefined },
    () => ({
      action: "none",
      data: undefined,
    })
  );
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
              sectionId: "",
              storeId: "",
              name: "",
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
            },
          });
          break;
        case "edit": {
          const sectionId = params.get("sectionId");
          const data = sectionId
            ? rows.find((row) => row.sectionId === sectionId)
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
    (row: StoreSectionRow) => {
      navigate(`${pageUrl}?action=edit&sectionId=${row.sectionId}`);
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);
  const handleAcceptNew = useCallback(
    (section: StoreSectionRow) => dispatch({ type: "accept", data: section }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawStoreSection(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToInsert = toRawStoreSection(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);

  const { response: insertResponse, error: insertError } =
    useStoreSectionInsert(backendApiUrl, dataToInsert, 1);
  const { result: insertResult } = insertResponse || {};
  const { response: updateResponse, error: updateError } =
    useStoreSectionUpdate(backendApiUrl, dataToUpdate, 1);
  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.section_id === resultData.section_id) {
        // dann hat das Einfügen geklappt
        dispatch({ type: "success", data: fromRawStoreSection(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawStoreSection(dataToInsert),
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
      if (dataToUpdate.section_id === resultData.section_id) {
        // dann hat das Aktualisieren geklappt
        dispatch({ type: "success", data: fromRawStoreSection(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawStoreSection(dataToUpdate),
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
          <Alert severity="error">{`Fehler beim Speichern von Lagerbereich <${actionState.data.sectionId}>. ${actionState.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "success-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Lagerbereich <${actionState.data.sectionId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "error-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler beim Ändern von Lagerbereich <${actionState.data.sectionId}>. ${actionState.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "success-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Lagerbereich <${actionState.data.sectionId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "new" && actionState.data && storeRows && (
        <CreateStoreSectionDialog
          section={actionState.data}
          stores={storeRows}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {actionState.action === "edit" && actionState.data && storeRows && (
        <EditStoreSectionDialog
          section={actionState.data}
          stores={storeRows}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Lagerbereich"}</Typography>
        </Grid>
        <Grid item>
          <Paper>
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
        {storeError && (
          <Grid item>
            <Paper>
              <Typography>{storeError}</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper
                style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
              >
                <StoreSectionsTable
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

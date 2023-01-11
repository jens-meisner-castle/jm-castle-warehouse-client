import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import {
  HashtagsTable,
  sizeVariantForWidth,
} from "../../../components/HashtagsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useHashtagInsert } from "../../../hooks/useHashtagInsert";
import { useHashtagSelect } from "../../../hooks/useHashtagSelect";
import { useHashtagUpdate } from "../../../hooks/useHashtagUpdate";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import {
  fromRawHashtag,
  HashtagRow,
  toRawHashtag,
} from "../../../types/RowTypes";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateHashtagDialog } from "./dialogs/CreateHashtagDialog";
import { EditHashtagDialog } from "./dialogs/EditHashtagDialog";

export const pageUrl = "/masterdata/hashtag";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const handleExpiredToken = useHandleExpiredToken();
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () => initialAction !== "none" && navigate(pageUrl),
    [initialAction, navigate]
  );

  const { response: selectResponse, error: selectError } = useHashtagSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { result: selectResult } = selectResponse || {};
  const rows = useMemo(() => {
    if (selectResult) {
      const newRows: HashtagRow[] = [];
      selectResult.rows.forEach((r) => {
        const newRow = fromRawHashtag(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [selectResult]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<HashtagRow>,
    ReducerState<HashtagRow>
  >(
    ActionStateReducer<HashtagRow>,
    { action: "none", data: undefined },
    () => ({ action: "none", data: undefined })
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
              tagId: "",
              name: "",
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
            },
          });
          break;
        case "edit": {
          const tagId = params?.tagId;
          const row = tagId
            ? rows.find((row) => row.tagId === tagId)
            : undefined;
          row &&
            dispatch({
              type: "edit",
              data: row,
            });
          break;
        }
        case "duplicate":
          {
            const tagId = params?.tagId;
            const data = tagId
              ? rows.find((row) => row.tagId === tagId)
              : undefined;
            data &&
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
          break;
      }
    }
  }, [initialAction, params, rows]);
  const handleEdit = useCallback(
    (row: HashtagRow) => {
      navigate(`${pageUrl}?action=edit&tagId=${row.tagId}`);
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: HashtagRow) => {
      navigate(`${pageUrl}?action=duplicate&tagId=${row.tagId}`);
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);

  const handleAccept = useCallback(
    (data: HashtagRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawHashtag(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToUpdate = toRawHashtag(data);
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } = useHashtagInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

  const { response: updateResponse, error: updateError } = useHashtagUpdate(
    backendApiUrl,
    dataToUpdate,
    dataToUpdate ? 1 : 0,
    handleExpiredToken
  );

  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.tag_id === resultData.tag_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawHashtag(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawHashtag(dataToInsert),
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
      if (dataToUpdate.tag_id === resultData.tag_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawHashtag(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawHashtag(dataToUpdate),
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
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Hashtag <${actionState.previous?.data.tagId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateHashtagDialog
          hashtag={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditHashtagDialog
          hashtag={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Hashtag"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        {selectError && (
          <Grid item>
            <Paper style={{ padding: 5, marginBottom: 5 }}>
              <Typography>{selectError}</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <HashtagsTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable
                  data={rows || []}
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

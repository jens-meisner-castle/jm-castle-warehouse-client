import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ImagesTable } from "../../../components/ImagesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useImageContentInsert } from "../../../hooks/useImageContentInsert";
import { useImageContentRows } from "../../../hooks/useImageContentRows";
import { useImageContentUpdate } from "../../../hooks/useImageContentUpdate";
import {
  fromRawImageContent,
  ImageContentRow,
  toRawImageContent,
} from "../../../types/RowTypes";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateImageContentDialog } from "./dialogs/CreateImageContentDialog";
import { EditImageContentDialog } from "./dialogs/EditImageContentDialog";
import { ImageContentEditState } from "./Types";

export const pageUrl = "/masterdata/image";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const handleExpiredToken = useHandleExpiredToken();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialAction = getValidInitialAction(params.get("action"));
  const resetInitialAction = useCallback(
    () => initialAction !== "none" && navigate(pageUrl),
    [initialAction, navigate]
  );

  const { response: selectResponse, error: selectError } = useImageContentRows(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { result: selectResult } = selectResponse || {};
  const rows = useMemo(() => {
    if (selectResult) {
      const newRows: ImageContentRow[] = [];
      selectResult.rows.forEach((r) => {
        const newRow = fromRawImageContent(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.imageId.localeCompare(b.imageId));
      return newRows;
    }
    return undefined;
  }, [selectResult]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<ImageContentEditState>,
    ReducerState<ImageContentEditState>
  >(
    ActionStateReducer<ImageContentEditState>,
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
              row: {
                imageId: "",
                imageExtension: "",
                sizeInBytes: 0,
                width: 0,
                height: 0,
                datasetVersion: 1,
                createdAt: new Date(),
                editedAt: new Date(),
              },
            },
          });
          break;
        case "edit": {
          const imageId = params.get("imageId");
          const row = imageId
            ? rows.find((row) => row.imageId === imageId)
            : undefined;
          row &&
            dispatch({
              type: "edit",
              data: { row },
            });
          break;
        }
        case "duplicate":
          {
            const imageId = params.get("imageId");
            const data = imageId
              ? rows.find((row) => row.imageId === imageId)
              : undefined;
            data &&
              dispatch({
                type: "new",
                data: {
                  row: {
                    ...data,
                    imageId: `${data.imageId}-copy`,
                    imageExtension: "",
                    sizeInBytes: 0,
                    width: 0,
                    height: 0,
                    datasetVersion: 1,
                    createdAt: new Date(),
                    editedAt: new Date(),
                  },
                },
              });
          }
          break;
      }
    }
  }, [initialAction, params, rows]);
  const handleEdit = useCallback(
    (row: ImageContentRow) => {
      navigate(`${pageUrl}?action=edit&imageId=${row.imageId}`);
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: ImageContentRow) => {
      navigate(`${pageUrl}?action=duplicate&imageId=${row.imageId}`);
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);
  const handleAccept = useCallback(
    (data: ImageContentEditState) => dispatch({ type: "accept", data }),
    []
  );
  console.log("actionState", actionState);

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const { row, newImage } = data;
      const { file } = newImage || {};
      const newToInsert = { row: toRawImageContent(row), imageFile: file };
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const { row, newImage } = data;
      const { file } = newImage || {};
      const newToUpdate = {
        row: toRawImageContent(row),
        imageFile: file,
      };
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } =
    useImageContentInsert(
      backendApiUrl,
      dataToInsert ? dataToInsert.row.image_id : undefined,
      dataToInsert ? dataToInsert.row.image_extension : undefined,
      dataToInsert ? dataToInsert.imageFile : undefined,
      1,
      handleExpiredToken
    );
  const { result: insertResult } = insertResponse || {};

  const { response: updateResponse, error: updateError } =
    useImageContentUpdate(
      backendApiUrl,
      dataToUpdate ? dataToUpdate.row.image_id : undefined,
      dataToUpdate ? dataToUpdate.row.image_extension : undefined,
      dataToUpdate ? dataToUpdate.row.dataset_version : undefined,
      dataToUpdate ? dataToUpdate.imageFile : undefined,
      1,
      handleExpiredToken
    );
  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.row.image_id === resultData.image_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: { row: fromRawImageContent(resultData) },
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: { row: fromRawImageContent(dataToInsert.row) },
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
      if (dataToUpdate.row.image_id === resultData.image_id) {
        // dann hat das Aktualisieren geklappt
        dispatch({
          type: "success",
          data: { row: fromRawImageContent(resultData) },
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: { row: fromRawImageContent(dataToUpdate.row) },
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
        displayPayload={`Bild <${actionState.previous?.data.row.imageId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateImageContentDialog
          imageContent={actionState.data.row}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditImageContentDialog
          imageContent={actionState.data.row}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Bilder"}</Typography>
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
                <ImagesTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable
                  displayImage="small"
                  data={rows || []}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  cellSize="small"
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import {
  ArticlesTable,
  sizeVariantForWidth,
} from "../../../components/ArticlesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleInsert } from "../../../hooks/useArticleInsert";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useArticleUpdate } from "../../../hooks/useArticleUpdate";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import {
  ArticleRow,
  fromRawArticle,
  toRawArticle,
} from "../../../types/RowTypes";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateArticleDialog } from "./dialogs/CreateArticleDialog";
import { EditArticleDialog } from "./dialogs/EditArticleDialog";

export const pageUrl = "/masterdata/article";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const handleExpiredToken = useHandleExpiredToken();
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () => initialAction !== "none" && navigate(pageUrl),
    [initialAction, navigate]
  );

  const { response: selectResponse, error: selectError } = useArticleSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { result: selectResult } = selectResponse || {};
  const rows = useMemo(() => {
    if (selectResult) {
      const newRows: ArticleRow[] = [];
      selectResult.rows.forEach((r) => {
        const newRow = fromRawArticle(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [selectResult]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<ArticleRow>,
    ReducerState<ArticleRow>
  >(
    ActionStateReducer<ArticleRow>,
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
              articleId: "",
              name: "",
              countUnit: "piece",
              imageRefs: undefined,
              hashtags: undefined,
              wwwLink: undefined,
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
            },
          });
          break;
        case "edit": {
          const articleId = params?.articleId;
          const row = articleId
            ? rows.find((row) => row.articleId === articleId)
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
            const articleId = params?.articleId;
            const data = articleId
              ? rows.find((row) => row.articleId === articleId)
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
    (row: ArticleRow) => {
      navigate(`${pageUrl}?action=edit&articleId=${row.articleId}`);
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: ArticleRow) => {
      navigate(`${pageUrl}?action=duplicate&articleId=${row.articleId}`);
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);

  const handleAccept = useCallback(
    (data: ArticleRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawArticle(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToUpdate = toRawArticle(data);
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } = useArticleInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

  const { response: updateResponse, error: updateError } = useArticleUpdate(
    backendApiUrl,
    dataToUpdate,
    dataToUpdate ? 1 : 0,
    handleExpiredToken
  );

  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.article_id === resultData.article_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawArticle(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawArticle(dataToInsert),
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
      if (dataToUpdate.article_id === resultData.article_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawArticle(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawArticle(dataToUpdate),
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
        displayPayload={`Artikel <${actionState.previous?.data.articleId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateArticleDialog
          article={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditArticleDialog
          article={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Artikel"}</Typography>
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
                <ArticlesTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable
                  displayImage="small"
                  sizeVariant={tableSize}
                  data={rows || []}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

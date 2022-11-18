import { Alert, Grid, Paper, Snackbar, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ArticlesTable } from "../../../components/ArticlesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleInsert } from "../../../hooks/useArticleInsert";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useArticleUpdate } from "../../../hooks/useArticleUpdate";
import {
  ArticleRow,
  fromRawArticle,
  toRawArticle,
} from "../../../types/RowTypes";
import { CreateArticleDialog } from "../dialogs/CreateArticleDialog";
import { EditArticleDialog } from "../dialogs/EditArticleDialog";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";

export const pageUrl = "/masterdata/article";

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

  const { result: selectResult, error: selectError } = useArticleSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
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
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
            },
          });
          break;
        case "edit": {
          const articleId = params.get("articleId");
          const data = articleId
            ? rows.find((row) => row.articleId === articleId)
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
    (row: ArticleRow) => {
      navigate(`${pageUrl}?action=edit&articleId=${row.articleId}`);
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);
  const handleAcceptNew = useCallback(
    (article: ArticleRow) => dispatch({ type: "accept", data: article }),
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
      const newToInsert = toRawArticle(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const { result: insertResult, error: insertError } = useArticleInsert(
    backendApiUrl,
    dataToInsert,
    1
  );
  const { result: updateResult, error: updateError } = useArticleUpdate(
    backendApiUrl,
    dataToUpdate,
    1
  );

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.article_id === resultData.article_id) {
        // dann hat das Einfügen geklappt
        dispatch({ type: "success", data: fromRawArticle(resultData) });
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
        // dann hat das Aktualisieren geklappt
        dispatch({ type: "success", data: fromRawArticle(resultData) });
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
      label: "Aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push({
      label: "Neu",
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
          <Alert severity="error">{`Fehler beim Speichern von Artikel <${actionState.data.articleId}>. ${actionState.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "success-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Artikel <${actionState.data.articleId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "error-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler beim Ändern von Artikel <${actionState.data.articleId}>. ${actionState.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "success-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Artikel <${actionState.data.articleId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "new" && actionState.data && (
        <CreateArticleDialog
          article={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditArticleDialog
          article={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Artikel"}</Typography>
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
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper
                style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
              >
                <ArticlesTable
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

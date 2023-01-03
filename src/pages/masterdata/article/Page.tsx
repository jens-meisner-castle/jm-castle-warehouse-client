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
import { Row_ImageContent } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ArticlesTable } from "../../../components/ArticlesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleInsert } from "../../../hooks/useArticleInsert";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useArticleUpdateWithImage } from "../../../hooks/useArticleUpdateWithImage";
import {
  ArticleRow,
  fromRawArticle,
  toRawArticle,
} from "../../../types/RowTypes";
import { initialMasterdataFields } from "../../../utils/DbValues";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateArticleDialog } from "./dialogs/CreateArticleDialog";
import { EditArticleDialog } from "./dialogs/EditArticleDialog";
import { ArticleEditState } from "./Types";

export const pageUrl = "/masterdata/article";

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
    typeof ActionStateReducer<ArticleEditState>,
    ReducerState<ArticleEditState>
  >(
    ActionStateReducer<ArticleEditState>,
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
                articleId: "",
                name: "",
                countUnit: "piece",
                articleImgRef: undefined,
                datasetVersion: 1,
                createdAt: new Date(),
                editedAt: new Date(),
              },
            },
          });
          break;
        case "edit": {
          const articleId = params.get("articleId");
          const row = articleId
            ? rows.find((row) => row.articleId === articleId)
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
            const articleId = params.get("articleId");
            const data = articleId
              ? rows.find((row) => row.articleId === articleId)
              : undefined;
            data &&
              dispatch({
                type: "new",
                data: {
                  row: {
                    ...data,
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
  const handleAcceptNew = useCallback(
    (article: ArticleRow) =>
      dispatch({ type: "accept", data: { row: article } }),
    []
  );
  const handleAccept = useCallback(
    (data: ArticleEditState) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawArticle(data.row);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const { row, newImage } = data;
      const { file, extension } = newImage || {};
      const imageContent:
        | Omit<Omit<Omit<Row_ImageContent, "size_in_bytes">, "width">, "height">
        | undefined =
        extension && file && row.articleImgRef
          ? {
              image_id: row.articleImgRef,
              image_extension: extension,
              ...initialMasterdataFields(),
            }
          : undefined;
      const newToUpdate = {
        row: toRawArticle(row),
        imageContent:
          imageContent && file ? { row: imageContent, file } : undefined,
      };
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

  const {
    result: completeUpdateResult,
    error: completeUpdateError,
    completed,
  } = useArticleUpdateWithImage(
    backendApiUrl,
    dataToUpdate ? dataToUpdate.row : undefined,
    dataToUpdate ? dataToUpdate.imageContent : undefined,
    dataToUpdate ? 1 : 0
  );

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.article_id === resultData.article_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: { row: fromRawArticle(resultData) },
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: { row: fromRawArticle(dataToInsert) },
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
    if (completed) {
      const { article, imageRef, imageContent } = completeUpdateResult || {};
      const { result, error: errorArticle } = article || {};
      const { error: errorImageRef } = imageRef || {};
      const { error: errorImageContent } = imageContent || {};
      if (dataToUpdate && result) {
        const { data: resultData } = result || {};
        if (
          resultData &&
          dataToUpdate.row.article_id === resultData.article_id
        ) {
          // dann hat das Aktualisieren geklappt
          dispatch({
            type: "success",
            data: { row: fromRawArticle(resultData) },
          });
          setIsAnySnackbarOpen(true);
          resetInitialAction();
          refreshStatus();
        }
      } else {
        const anyError = errorArticle || errorImageRef || errorImageContent;
        if (dataToUpdate && anyError) {
          // dann ist etwas schief gelaufen
          dispatch({
            type: "error",
            data: { row: fromRawArticle(dataToUpdate.row) },
            error: anyError,
          });
          setIsAnySnackbarOpen(true);
          resetInitialAction();
          refreshStatus();
        }
      }
    }
  }, [
    completed,
    dataToUpdate,
    completeUpdateError,
    completeUpdateResult,
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
      {actionState.previous && actionState.previous.action === "error-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler beim Speichern von Artikel <${actionState.previous.data.row.articleId}>. ${actionState.previous.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.previous && actionState.previous.action === "success-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Artikel <${actionState.previous.data.row.articleId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.previous && actionState.previous.action === "error-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler beim Ändern von Artikel <${actionState.previous.data.row.articleId}>. ${actionState.previous.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.previous && actionState.previous.action === "success-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="success">{`Artikel <${actionState.previous.data.row.articleId}> wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.action === "new" && actionState.data && (
        <CreateArticleDialog
          article={actionState.data.row}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditArticleDialog
          article={actionState.data.row}
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
                  displayImage="small"
                  data={rows || []}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
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

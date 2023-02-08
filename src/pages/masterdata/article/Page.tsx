import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorDisplays } from "../../../components/ErrorDisplays";
import {
  ArticlesTable,
  sizeVariantForWidth,
} from "../../../components/table/ArticlesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleInsert } from "../../../hooks/useArticleInsert";
import { useArticleUpdate } from "../../../hooks/useArticleUpdate";
import { useMasterdata } from "../../../hooks/useMasterdata";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  ArticleRow,
  compareArticleRow,
  fromRawArticle,
  toRawArticle,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateArticleDialog } from "./dialogs/CreateArticleDialog";
import { EditArticleDialog } from "./dialogs/EditArticleDialog";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<ArticleRow>[]>([
    { field: "articleId", direction: "ascending" },
  ]);
  const handleExpiredToken = useHandleExpiredToken();
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataArticle.path, { replace: true }),
    [initialAction, navigate]
  );

  const { errors, rows } = useMasterdata(
    backendApiUrl,
    { article: true, hashtag: true, manufacturer: true, attribute: true },
    updateIndicator,
    handleExpiredToken
  );
  const { articleRows, hashtagRows, manufacturerRows, attributeRows } = rows;

  const filteredOrderedRows = useMemo(() => {
    if (!articleRows) return undefined;
    const filtered = [...articleRows]; //.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<ArticleRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareArticleRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [articleRows, order]);

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
    if (initialAction && articleRows) {
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
              manufacturer: "",
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
              attributes: undefined,
            },
          });
          break;
        case "edit": {
          const articleId = params?.articleId;
          const row = articleId
            ? articleRows.find((row) => row.articleId === articleId)
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
              ? articleRows.find((row) => row.articleId === articleId)
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
  }, [initialAction, params, articleRows]);
  const handleEdit = useCallback(
    (row: ArticleRow) => {
      navigate(
        `${allRoutes().masterdataArticle.path}?action=edit&articleId=${
          row.articleId
        }`
      );
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: ArticleRow) => {
      navigate(
        `${allRoutes().masterdataArticle.path}?action=duplicate&articleId=${
          row.articleId
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
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push({
      tooltip: "Neuen Datensatz anlegen",
      label: <AddBoxIcon />,
      onClick: () =>
        navigate(`${allRoutes().masterdataArticle.path}?action=new`),
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
          availableHashtags={hashtagRows || []}
          availableManufacturers={manufacturerRows || []}
          availableAttributes={attributeRows || []}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditArticleDialog
          article={actionState.data}
          availableHashtags={hashtagRows || []}
          availableManufacturers={manufacturerRows || []}
          availableAttributes={attributeRows || []}
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
        {!!Object.keys(errors).length && (
          <Grid item>
            <Paper style={{ padding: 5, marginBottom: 5 }}>
              <ErrorDisplays results={errors} />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <ArticlesTable
                  containerStyle={{ width: "100%", maxWidth: undefined }}
                  editable
                  displayImage="small"
                  sizeVariant={tableSize}
                  data={filteredOrderedRows || []}
                  availableAttributes={attributeRows || []}
                  order={order}
                  onOrderChange={setOrder}
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

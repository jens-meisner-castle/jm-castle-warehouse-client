import { Grid, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useHandleExpiredToken } from "../../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../../components/ActionStateSnackbars";
import { ErrorDisplays } from "../../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../../configuration/Urls";
import { useMasterdata } from "../../../../hooks/pagination/useMasterdata";
import { useArticleInsert } from "../../../../hooks/useArticleInsert";
import {
  ArticleRow,
  fromRawArticle,
  initialMasterdataRow,
  isArticleRow,
  toRawArticle,
} from "../../../../types/RowTypes";
import { CreateArticleDialog } from "../../article/dialogs/CreateArticleDialog";
import { ActionStateReducer } from "../../utils/Reducer";

export interface ArticlesProps {
  count: number;
  onNew: () => void;
}

export const Articles = (props: ArticlesProps) => {
  const { count, onNew } = props;
  const handleExpiredToken = useHandleExpiredToken();

  const { rows, errors: errorData } = useMasterdata(
    backendApiUrl,
    { manufacturer: true, hashtag: true, attribute: true },
    1,
    handleExpiredToken
  );
  const { attributeRows, hashtagRows, manufacturerRows } = rows;

  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);

  const [actionState, dispatch] = useReducer(ActionStateReducer<ArticleRow>, {
    action: "none",
    data: undefined,
  });

  const dataToInsert = useMemo(() => {
    const { data: row } = actionState;
    if (actionState.action === "accept-new" && row && isArticleRow(row)) {
      return toRawArticle(row);
    }
    return undefined;
  }, [actionState]);

  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
  }, []);

  const handleAccept = useCallback(
    (data: ArticleRow) => dispatch({ type: "accept", data }),
    []
  );

  useEffect(() => {
    if (actionState.action === "success-new") {
      onNew();
      dispatch({ type: "reset" });
    }
    if (actionState.action === "error-new") {
      dispatch({ type: "reset" });
    }
  }, [actionState, onNew]);

  const { response: insertResponse, error: insertError } = useArticleInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

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
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawArticle(dataToInsert),
        error: insertError,
      });
      setIsAnySnackbarOpen(true);
    }
  }, [dataToInsert, insertResult, insertError]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/article" },
    });
    newActions.push({
      label: "New",
      onClick: () => dispatch({ type: "new", data: initialMasterdataRow() }),
    });
    return newActions;
  }, []);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Artikel <${actionState.previous?.data?.articleId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" &&
        attributeRows &&
        manufacturerRows &&
        hashtagRows && (
          <CreateArticleDialog
            article={actionState.data}
            availableAttributes={attributeRows}
            availableHashtags={hashtagRows}
            availableManufacturers={manufacturerRows}
            open={true}
            handleCancel={handleCancel}
            handleAccept={handleAccept}
          />
        )}
      <Grid container direction="column">
        <Grid item>
          <Typography>{`Artikel (${count})`}</Typography>
        </Grid>
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        <Grid item>
          <AppActions actions={actions} />
        </Grid>
      </Grid>
    </>
  );
};

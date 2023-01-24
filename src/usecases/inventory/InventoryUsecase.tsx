import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import {
  ArticleRow,
  isArticleRow,
  isSavingArticleAllowed,
} from "../../types/RowTypes";
import { GeneralUsecaseProps, InventoryState } from "../Types";
import { CompareArticleStock } from "./views/CompareArticleStock";
import { CreateArticle } from "./views/CreateArticle";
import { FindArticle } from "./views/FindArticle";
import { WellDone } from "./views/WellDone";

export type InventoryUsecaseProps = GeneralUsecaseProps & InventoryState;

const views = {
  "find-article": {
    description:
      "Wählen Sie einen Artikel aus und drücken 'Weiter'. Oder drücken Sie 'Neuen Artikel anlegen'.",
  },
  "add-article": {
    description:
      "Füllen Sie alle notwendigen Felder aus und drücken 'Weiter'. Oder drücken Sie 'Zurück'.",
  },
  "compare-stock": {
    description:
      "Tragen Sie die tatsächlich vorhandene Menge für einen oder mehrere Lagerbereiche ein und drücken 'Weiter'. Oder drücken Sie 'Zurück'.",
  },
  finished: { description: "Well done!" },
};

export const InventoryUsecase = (props: InventoryUsecaseProps) => {
  const { data, id, setUsecaseState, sizeVariant } = props;
  const { article, temp, newArticle } = data;
  const { article: partialArticle } = temp;
  const [errorData, setErrorData] = useState<Record<string, ErrorData>>({});
  const [view, setView] = useState<keyof typeof views>("find-article");

  const handleExpiredToken = useHandleExpiredToken();

  const handleChangedSelectedArticle = useCallback(
    (article: ArticleRow | null) => {
      setUsecaseState({
        id,
        data: { temp, article: article || undefined },
      });
    },
    [id, temp, setUsecaseState]
  );

  const handleChangedPartialArticle = useCallback(
    (partialArticle: Partial<ArticleRow>) => {
      setUsecaseState({
        id,
        data: { temp: { article: partialArticle }, article },
      });
    },
    [id, article, setUsecaseState]
  );

  /** view: find-article */
  const findArticleActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Weiter",
      disabled: !article,
      onClick: () => {
        setUsecaseState({
          id,
          data: {
            article,
            newArticle: undefined,
            temp: {},
          },
        });
        setView("compare-stock");
      },
    });
    actions.push({
      label: "Neuen Artikel anlegen",
      onClick: () => setView("add-article"),
    });
    return actions;
  }, [article, setUsecaseState, id]);
  /** view: add-article */
  const addArticleActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("find-article"),
    });
    actions.push({
      label: "Weiter",
      disabled: !partialArticle || !isSavingArticleAllowed(partialArticle),
      onClick: () => {
        if (partialArticle && isArticleRow(partialArticle)) {
          setUsecaseState({
            id,
            data: {
              article: partialArticle,
              newArticle: partialArticle,
              temp: { article: partialArticle },
            },
          });
          setView("finished");
        }
      },
    });
    return actions;
  }, [partialArticle, setUsecaseState, id]);
  /** view: compare-stock */
  const compareStockActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("find-article"),
    });
    actions.push({
      label: "Weiter",
      onClick: () => {
        setView("finished");
      },
    });
    return actions;
  }, []);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Inventur (${id})`}</Typography>
      </Grid>
      {!!Object.keys(errorData).length && (
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
      )}
      {view === "find-article" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <FindArticle
              actions={findArticleActions}
              handleExpiredToken={handleExpiredToken}
              onError={setErrorData}
              description={views["find-article"].description}
              article={article}
              onChangeArticle={handleChangedSelectedArticle}
            />
          </Paper>
        </Grid>
      )}
      {view === "add-article" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <CreateArticle
              actions={addArticleActions}
              handleExpiredToken={handleExpiredToken}
              onError={setErrorData}
              description={views["add-article"].description}
              article={partialArticle}
              onChangeArticle={handleChangedPartialArticle}
            />
          </Paper>
        </Grid>
      )}
      {view === "compare-stock" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <CompareArticleStock
              sizeVariant={sizeVariant}
              actions={compareStockActions}
              handleExpiredToken={handleExpiredToken}
              onError={setErrorData}
              description={views["compare-stock"].description}
              article={newArticle || article}
            />
          </Paper>
        </Grid>
      )}
      {view === "finished" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <WellDone />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

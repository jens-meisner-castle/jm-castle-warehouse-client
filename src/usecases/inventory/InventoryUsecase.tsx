import { Grid, Paper, Typography } from "@mui/material";
import { AppAction } from "jm-castle-components/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { ErrorData } from "../../components/ErrorDisplays";
import { backendApiUrl } from "../../configuration/Urls";
import { useMasterdata } from "../../hooks/pagination/useMasterdata";
import {
  ArticleRow,
  EmissionRow,
  isArticleRow,
  isSavingArticleAllowed,
  ReceiptRow,
} from "../../types/RowTypes";
import { ErrorView } from "../general-views/ErrorView";
import { Execution } from "../general-views/Execution";
import { WellDone } from "../general-views/WellDone";
import {
  GeneralUsecaseProps,
  InventoryState,
  SectionDifference,
} from "../Types";
import { CreateArticle } from "./views/CreateArticle";
import { EditArticleStockStates } from "./views/EditArticleStockStates";
import { FindArticle } from "./views/FindArticle";
import { Summary } from "./views/Summary";

export type InventoryUsecaseProps = GeneralUsecaseProps & InventoryState;

const views = {
  "find-article": {
    description:
      "Wählen Sie einen Artikel aus und drücken 'Weiter'. Oder drücken Sie 'Neuer Artikel'.",
  },
  "add-article": {
    description: "Füllen Sie alle notwendigen Felder aus und drücken 'Weiter'.",
  },
  "edit-article-stock-states": {
    description:
      "Tragen Sie die tatsächlich vorhandene Menge für einen oder mehrere Lagerbereiche ein. Sie können auch für weitere Lagerbereiche hinzufügen.",
  },
  summary: { description: "Zusammenfassung" },
  execution: { description: "Die Buchungen werden durchgeführt..." },
  "well-done": { description: "Die Buchungen waren erfolgreich." },
  error: { description: "Da ist etwas schief gelaufen." },
};

export const InventoryUsecase = (props: InventoryUsecaseProps) => {
  const { data, id, updateUsecaseData, cancelUsecase, sizeVariant } = props;
  const {
    article,
    temporaryArticle,
    newArticle,
    sectionDifferences,
    emissions,
    receipts,
  } = data;
  const [errorData, setErrorData] = useState<Record<string, ErrorData>>({});

  const updateErrorData = useCallback(
    (updates: Record<string, ErrorData>) =>
      setErrorData((previous) => ({ ...previous, ...updates })),
    []
  );

  const [view, setView] = useState<keyof typeof views>("find-article");

  const handleExpiredToken = useHandleExpiredToken();

  const { rows, errors } = useMasterdata(
    backendApiUrl,
    { article: true, section: true, costunit: true },
    1,
    handleExpiredToken
  );

  const {
    articleRows: availableArticles,
    sectionRows: allSections,
    costunitRows: allCostunits,
  } = rows || {};

  useEffect(() => updateErrorData(errors), [updateErrorData, errors]);

  const handleChangedSelectedArticle = useCallback(
    (article: ArticleRow | null) => {
      updateUsecaseData({
        id,
        data: { article: article || undefined, sectionDifferences: undefined },
      });
    },
    [id, updateUsecaseData]
  );

  const handleChangedPartialArticle = useCallback(
    (temporaryArticle: Partial<ArticleRow>) => {
      updateUsecaseData({
        id,
        data: { temporaryArticle },
      });
    },
    [id, updateUsecaseData]
  );

  const handleChangedSectionDifferences = useCallback(
    (sectionDifferences: SectionDifference[]) => {
      updateUsecaseData({
        id,
        data: { sectionDifferences },
      });
    },
    [id, updateUsecaseData]
  );

  const handleChangedSummary = useCallback(
    (moves: { emissions: EmissionRow[]; receipts: ReceiptRow[] }) => {
      updateUsecaseData({ id, data: moves });
    },
    [updateUsecaseData, id]
  );

  /** view: find-article */
  const findArticleActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Neuer Artikel",
      onClick: () => setView("add-article"),
    });
    actions.push({
      label: "Weiter",
      disabled: !article,
      onClick: () => {
        updateUsecaseData({
          id,
          data: {
            article,
            newArticle: undefined,
            temporaryArticle: undefined,
          },
        });
        setView("edit-article-stock-states");
      },
    });

    return actions;
  }, [article, updateUsecaseData, cancelUsecase, id]);
  /** view: add-article */
  const addArticleActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("find-article"),
    });
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Weiter",
      disabled: !temporaryArticle || !isSavingArticleAllowed(temporaryArticle),
      onClick: () => {
        if (temporaryArticle && isArticleRow(temporaryArticle)) {
          updateUsecaseData({
            id,
            data: {
              article: temporaryArticle,
              newArticle: temporaryArticle,
              temporaryArticle,
            },
          });
          setView("edit-article-stock-states");
        }
      },
    });

    return actions;
  }, [temporaryArticle, updateUsecaseData, cancelUsecase, id]);
  /** view: edit-article-stock-states */
  const isAnyInventoryChanged = !!sectionDifferences?.find(
    (d) =>
      typeof d.newValue === "number" &&
      d.currentValue !== d.newValue &&
      d.costUnit
  );

  const editStockActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("find-article"),
    });
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Weiter",
      disabled: !isAnyInventoryChanged,
      onClick: () => {
        setView("summary");
      },
    });

    return actions;
  }, [cancelUsecase, isAnyInventoryChanged]);
  /** view: summary */
  const summaryActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("edit-article-stock-states"),
    });
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Fertigstellen",
      disabled: !emissions?.length && !receipts?.length,
      onClick: () => {
        setView("execution");
      },
    });
    return actions;
  }, [emissions, receipts, cancelUsecase]);
  /** view: error */
  const errorActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Ok",
      onClick: cancelUsecase,
    });
    return actions;
  }, [cancelUsecase]);
  /** view: well-done */
  const wellDoneActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Ok",
      onClick: cancelUsecase,
    });
    return actions;
  }, [cancelUsecase]);

  useEffect(() => {
    !!Object.keys(errorData).length && setView("error");
  }, [errorData]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Inventur (${id})`}</Typography>
      </Grid>
      {view === "error" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <ErrorView
              description={views["error"].description}
              errorData={errorData}
              actions={errorActions}
            />
          </Paper>
        </Grid>
      )}
      {view === "find-article" && availableArticles && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <FindArticle
              actions={findArticleActions}
              description={views["find-article"].description}
              availableArticles={availableArticles}
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
              onError={updateErrorData}
              description={views["add-article"].description}
              article={temporaryArticle}
              onChangeArticle={handleChangedPartialArticle}
            />
          </Paper>
        </Grid>
      )}
      {view === "edit-article-stock-states" && allSections && allCostunits && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <EditArticleStockStates
              sizeVariant={sizeVariant}
              actions={editStockActions}
              handleExpiredToken={handleExpiredToken}
              onError={updateErrorData}
              description={views["edit-article-stock-states"].description}
              availableSections={allSections}
              availableCostunits={allCostunits}
              sectionDifferences={sectionDifferences || []}
              onChangeSectionDifferences={handleChangedSectionDifferences}
              article={newArticle || article}
            />
          </Paper>
        </Grid>
      )}
      {view === "summary" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <Summary
              sizeVariant={sizeVariant}
              actions={summaryActions}
              description={views["summary"].description}
              onChangeSummary={handleChangedSummary}
              data={data}
            />
          </Paper>
        </Grid>
      )}
      {view === "execution" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <Execution description={views["execution"].description} />
          </Paper>
        </Grid>
      )}
      {view === "well-done" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <WellDone
              description={views["well-done"].description}
              actions={wellDoneActions}
            />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

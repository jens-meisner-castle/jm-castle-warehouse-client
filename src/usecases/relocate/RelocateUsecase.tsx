import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction } from "../../components/AppActions";
import { ErrorData } from "../../components/ErrorDisplays";
import { backendApiUrl } from "../../configuration/Urls";
import { useEmissionInsert } from "../../hooks/useEmissionInsert";
import { useMasterdata } from "../../hooks/useMasterdata";
import { useReceiptInsert } from "../../hooks/useReceiptInsert";
import {
  ArticleRow,
  EmissionRow,
  ReceiptRow,
  StoreSectionRow,
  toRawEmission,
  toRawReceipt,
} from "../../types/RowTypes";
import { ErrorView } from "../general-views/ErrorView";
import { Execution } from "../general-views/Execution";
import { WellDone } from "../general-views/WellDone";
import { GeneralUsecaseProps, RelocateState } from "../Types";
import { FindStockStateSource } from "./views/FindStockStateSource";
import { FindStockStateTarget } from "./views/FindStockStateTarget";
import { Summary } from "./views/Summary";

export type RelocateUsecaseProps = GeneralUsecaseProps & RelocateState;

const views = {
  "find-source": {
    description:
      "Wählen Sie einen Lagerbereich als Quelle und einen Artikel aus und drücken 'Weiter'.",
  },
  "find-target": {
    description:
      "Wählen Sie einen Lagerbereich als Ziel aus und drücken 'Weiter'.",
  },
  summary: { description: "Zusammenfassung" },
  execution: { description: "Die Buchungen werden durchgeführt..." },
  "well-done": { description: "Die Buchungen waren erfolgreich." },
  error: { description: "Da ist etwas schief gelaufen." },
};

export const RelocateUsecase = (props: RelocateUsecaseProps) => {
  const { data, id, updateUsecaseData, cancelUsecase, sizeVariant } = props;
  const { from, to, article, emission, receipt } = data;

  const [errorData, setErrorData] = useState<Record<string, ErrorData>>({});

  const updateErrorData = useCallback(
    (updates: Record<string, ErrorData>) =>
      setErrorData((previous) => ({ ...previous, ...updates })),
    []
  );

  const [view, setView] = useState<keyof typeof views>("find-source");

  const handleExpiredToken = useHandleExpiredToken();

  const handleChangedSelectedFrom = useCallback(
    (from: StoreSectionRow | null) => {
      updateUsecaseData({
        id,
        data: { from: from || undefined, article: undefined },
      });
    },
    [id, updateUsecaseData]
  );

  const handleChangedSelectedTo = useCallback(
    (to: StoreSectionRow | null) => {
      updateUsecaseData({
        id,
        data: { to: to || undefined },
      });
    },
    [id, updateUsecaseData]
  );

  const handleChangedSelectedArticle = useCallback(
    (article: ArticleRow | null) => {
      updateUsecaseData({
        id,
        data: { article: article || undefined },
      });
    },
    [id, updateUsecaseData]
  );

  const handleChangedSummary = useCallback(
    (moves: {
      emission: EmissionRow;
      receipt: ReceiptRow;
      originalReceipt: ReceiptRow;
    }) => {
      updateUsecaseData({ id, data: moves });
    },
    [updateUsecaseData, id]
  );

  const { rows, errors } = useMasterdata(
    backendApiUrl,
    { section: true },
    1,
    handleExpiredToken
  );
  const { sectionRows } = rows;

  const availableTargetSections = useMemo(() => {
    if (!sectionRows || !from) return undefined;
    return sectionRows.filter((r) => r.sectionId !== from.sectionId);
  }, [sectionRows, from]);

  useEffect(() => {
    Object.keys(errors).length && updateErrorData(errors);
  }, [errors, updateErrorData]);

  /** view: find-source */
  const findSourceActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Weiter",
      disabled: !article || !from,
      onClick: () => {
        setView("find-target");
      },
    });
    return actions;
  }, [article, from, cancelUsecase]);

  /** view: find-target */
  const findTargetActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("find-source"),
    });
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Weiter",
      disabled: !to,
      onClick: () => {
        setView("summary");
      },
    });
    return actions;
  }, [to, cancelUsecase]);
  /** view: summary */
  const summaryActions = useMemo(() => {
    const actions: AppAction[] = [];
    actions.push({
      label: "Zurück",
      onClick: () => setView("find-target"),
    });
    actions.push({
      label: "Abbrechen",
      onClick: cancelUsecase,
    });
    actions.push({
      label: "Fertigstellen",
      disabled: !emission || !receipt,
      onClick: () => {
        setView("execution");
      },
    });
    return actions;
  }, [emission, receipt, cancelUsecase]);
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

  const rawEmission = useMemo(
    () => emission && toRawEmission(emission),
    [emission]
  );
  const rawReceipt = useMemo(() => receipt && toRawReceipt(receipt), [receipt]);
  const insertEmissionApiResponse = useEmissionInsert(
    backendApiUrl,
    rawEmission,
    view === "execution" ? 1 : 0,
    handleExpiredToken
  );
  const insertReceiptApiResponse = useReceiptInsert(
    backendApiUrl,
    rawReceipt,
    view === "execution" ? 1 : 0,
    handleExpiredToken
  );

  useEffect(() => {
    if (insertEmissionApiResponse.error || insertReceiptApiResponse.error) {
      const newData: Record<string, ErrorData> = {};
      newData.emission = insertEmissionApiResponse;
      newData.receipt = insertReceiptApiResponse;
      updateErrorData(newData);
    }
  }, [insertEmissionApiResponse, insertReceiptApiResponse, updateErrorData]);

  useEffect(() => {
    if (view !== "execution") return;
    if (
      insertEmissionApiResponse.response?.result?.data &&
      insertReceiptApiResponse.response?.result?.data
    ) {
      return setView("well-done");
    }
    if (insertEmissionApiResponse.error || insertReceiptApiResponse.error) {
      return setView("error");
    }
  }, [insertEmissionApiResponse, insertReceiptApiResponse, view]);

  useEffect(() => {
    !!Object.keys(errorData).length && setView("error");
  }, [errorData]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Umlagern (${id})`}</Typography>
      </Grid>
      {!!Object.keys(errorData).length && (
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
      {view === "find-source" && sectionRows && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <FindStockStateSource
              actions={findSourceActions}
              sizeVariant={sizeVariant}
              handleExpiredToken={handleExpiredToken}
              onError={updateErrorData}
              description={views["find-source"].description}
              availableSections={sectionRows}
              section={from}
              onChangeSection={handleChangedSelectedFrom}
              article={article}
              onChangeArticle={handleChangedSelectedArticle}
            />
          </Paper>
        </Grid>
      )}
      {view === "find-target" && availableTargetSections && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <FindStockStateTarget
              actions={findTargetActions}
              sizeVariant={sizeVariant}
              handleExpiredToken={handleExpiredToken}
              onError={updateErrorData}
              description={views["find-target"].description}
              availableSections={availableTargetSections}
              section={to}
              onChangeSection={handleChangedSelectedTo}
            />
          </Paper>
        </Grid>
      )}
      {view === "summary" && (
        <Grid item>
          <Paper style={{ padding: 5 }}>
            <Summary
              data={data}
              onChangeSummary={handleChangedSummary}
              sizeVariant={sizeVariant}
              handleExpiredToken={handleExpiredToken}
              actions={summaryActions}
              description={views["summary"].description}
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

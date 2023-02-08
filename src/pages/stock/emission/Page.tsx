import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useHandleExpiredToken,
  useVerifiedUser,
} from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import {
  EmissionsTable,
  sizeVariantForWidth,
} from "../../../components/table/EmissionsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeFilterComponent } from "../../../filter/TimeFilterComponent";
import { TimeintervalFilter } from "../../../filter/Types";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useCostunitSelect } from "../../../hooks/useCostunitSelect";
import { useEmissionInsert } from "../../../hooks/useEmissionInsert";
import { useEmissionSelect } from "../../../hooks/useEmissionSelect";
import { useReceiverSelect } from "../../../hooks/useReceiverSelect";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  ArticleRow,
  compareEmissionRow,
  CostunitRow,
  EmissionRow,
  fromRawArticle,
  fromRawCostunit,
  fromRawEmission,
  fromRawReceiver,
  fromRawStoreSection,
  ReceiverRow,
  StoreSectionRow,
  toRawEmission,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import { getNewFilter } from "../../../utils/Filter";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateEmissionDialog } from "./dialogs/CreateEmissionDialog";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<EmissionRow>[]>([
    { field: "emittedAt", direction: "descending" },
  ]);
  const [filter, setFilter] = useState<TimeintervalFilter>(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }),
      to: DateTime.now().endOf("day"),
    })
  );
  const [isFilterComponentVisible, setIsFilterComponentVisible] =
    useState(false);
  const handleHideFilterComponent = useCallback(
    () => setIsFilterComponentVisible(false),
    []
  );
  const handleShowFilterComponent = useCallback(
    () => setIsFilterComponentVisible(true),
    []
  );
  const handleFilterChange = useCallback((newFilter: TimeintervalFilter) => {
    setFilter(newFilter);
  }, []);
  const handleExpiredToken = useHandleExpiredToken();
  const { username } = useVerifiedUser() || {};
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().stockEmission.path, { replace: true }),
    [initialAction, navigate]
  );

  const emissionApiResponse = useEmissionSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: emissionResponse } = emissionApiResponse;
  const { result: emissionResult } = emissionResponse || {};
  const emissionRows = useMemo(() => {
    if (emissionResult) {
      const newRows: EmissionRow[] = [];
      emissionResult.rows.forEach((r) => {
        const newRow = fromRawEmission(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.emittedAt.getTime() - b.emittedAt.getTime());
      return newRows;
    }
    return undefined;
  }, [emissionResult]);

  const filteredOrderedRows = useMemo(() => {
    if (!emissionRows) return undefined;
    const filtered = [...emissionRows]; //.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<EmissionRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareEmissionRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [emissionRows, order]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<EmissionRow>,
    ReducerState<EmissionRow>
  >(
    ActionStateReducer<EmissionRow>,
    { action: "none", data: undefined },
    () => ({ action: "none", data: undefined })
  );

  const articleApiResponse = useArticleSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const articleRows = useMemo(() => {
    const newRows: ArticleRow[] = [];
    const { rows } = articleResult || {};
    rows?.forEach((raw) => newRows.push(fromRawArticle(raw)));
    return newRows;
  }, [articleResult]);

  const receiverApiResponse = useReceiverSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: receiverResponse } = receiverApiResponse;
  const { result: receiverResult } = receiverResponse || {};
  const receiverRows = useMemo(() => {
    const newRows: ReceiverRow[] = [];
    const { rows } = receiverResult || {};
    rows?.forEach((raw) => newRows.push(fromRawReceiver(raw)));
    return newRows;
  }, [receiverResult]);

  const costunitApiResponse = useCostunitSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: costunitResponse } = costunitApiResponse;
  const { result: costunitResult } = costunitResponse || {};
  const costunitRows = useMemo(() => {
    const newRows: CostunitRow[] = [];
    const { rows } = costunitResult || {};
    rows?.forEach((raw) => newRows.push(fromRawCostunit(raw)));
    return newRows;
  }, [costunitResult]);

  const sectionsApiResponse = useStoreSectionSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response: sectionsResponse } = sectionsApiResponse;
  const { result: sectionsResult } = sectionsResponse || {};
  const sectionRows = useMemo(() => {
    const newRows: StoreSectionRow[] = [];
    const { rows } = sectionsResult || {};
    rows?.forEach((raw) => newRows.push(fromRawStoreSection(raw)));
    return newRows;
  }, [sectionsResult]);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.storeSection = sectionsApiResponse;
    newData.emission = emissionApiResponse;
    return newData;
  }, [sectionsApiResponse, emissionApiResponse]);

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && emissionRows) {
      switch (initialAction) {
        case "new":
          dispatch({
            type: "new",
            data: {
              datasetId: "new",
              sectionId: "",
              byUser: username || "",
              articleId: "",
              articleCount: 1,
              emittedAt: new Date(),
              reason: "loan",
              receiver: "",
              costUnit: "",
              imageRefs: undefined,
              price: undefined,
            },
          });
          break;
        case "duplicate":
          {
            const datasetId = params?.datasetId;
            const datasetNumber = datasetId
              ? Number.parseInt(datasetId)
              : undefined;
            const data = datasetId
              ? emissionRows.find((row) => row.datasetId === datasetNumber)
              : undefined;
            data &&
              dispatch({
                type: "new",
                data: {
                  ...data,
                  datasetId: "new",
                  byUser: username || "",
                  emittedAt: new Date(),
                },
              });
          }
          break;
      }
    }
  }, [initialAction, params, emissionRows, username]);
  const handleDuplicate = useCallback(
    (row: EmissionRow) => {
      navigate(
        `${allRoutes().stockEmission.path}?action=duplicate&datasetId=${
          row.datasetId
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
    (data: EmissionRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawEmission(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);

  const { response: insertResponse, error: insertError } = useEmissionInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (
        dataToInsert.article_id === resultData.article_id &&
        dataToInsert.emitted_at === resultData.emitted_at
      ) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawEmission(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawEmission(dataToInsert),
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

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push({
      label: isFilterComponentVisible ? <FilterAltOff /> : <FilterAlt />,
      tooltip: isFilterComponentVisible
        ? "Filter ausblenden"
        : "Filter einblenden",
      onClick: isFilterComponentVisible
        ? handleHideFilterComponent
        : handleShowFilterComponent,
    });
    newActions.push({
      label: (
        <Tooltip title="Neuen Datensatz anlegen">
          <AddBoxIcon />
        </Tooltip>
      ),
      onClick: () => navigate(`${allRoutes().stockEmission.path}?action=new`),
    });
    return newActions;
  }, [
    refreshStatus,
    handleHideFilterComponent,
    handleShowFilterComponent,
    isFilterComponentVisible,
    navigate,
  ]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Ausgang <${actionState.previous?.data.datasetId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateEmissionDialog
          receipt={actionState.data}
          articles={articleRows}
          receivers={receiverRows}
          storeSections={sectionRows}
          costunits={costunitRows}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Warenausgang"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        {isFilterComponentVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5 }}>
              <TimeFilterComponent
                filter={filter}
                onChange={handleFilterChange}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <EmissionsTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable
                  data={filteredOrderedRows || []}
                  order={order}
                  onOrderChange={setOrder}
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

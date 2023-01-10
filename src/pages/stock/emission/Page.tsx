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
import { EmissionsTable } from "../../../components/EmissionsTable";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../configuration/Urls";
import { FilterComponent } from "../../../filter/FilterComponent";
import { TimeintervalFilter } from "../../../filter/Types";
import { useEmissionInsert } from "../../../hooks/useEmissionInsert";
import { useEmissionSelect } from "../../../hooks/useEmissionSelect";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useUrlAction } from "../../../hooks/useUrlAction";
import {
  EmissionRow,
  fromRawEmission,
  fromRawStoreSection,
  StoreSectionRow,
  toRawEmission,
} from "../../../types/RowTypes";
import { getNewFilter } from "../../../utils/Filter";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateEmissionDialog } from "./dialogs/CreateEmissionDialog";

export const pageUrl = "/stock/emission";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [filter, setFilter] = useState<TimeintervalFilter>(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }),
      to: DateTime.now().endOf("day"),
    })
  );
  const handleFilterChange = useCallback((newFilter: TimeintervalFilter) => {
    setFilter(newFilter);
  }, []);
  const handleExpiredToken = useHandleExpiredToken();
  const { username } = useVerifiedUser() || {};
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () => initialAction !== "none" && navigate(pageUrl),
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
  const rows = useMemo(() => {
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

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<EmissionRow>,
    ReducerState<EmissionRow>
  >(
    ActionStateReducer<EmissionRow>,
    { action: "none", data: undefined },
    () => ({ action: "none", data: undefined })
  );

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
    return newRows.length ? newRows : undefined;
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
    if (initialAction && rows) {
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
              ? rows.find((row) => row.datasetId === datasetNumber)
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
  }, [initialAction, params, rows, username]);
  const handleDuplicate = useCallback(
    (row: EmissionRow) => {
      navigate(`${pageUrl}?action=duplicate&datasetId=${row.datasetId}`);
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
        displayPayload={`Ausgang <${actionState.previous?.data.datasetId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && sectionRows && (
        <CreateEmissionDialog
          receipt={actionState.data}
          storeSections={sectionRows}
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
        <Grid item>
          <Paper>
            <FilterComponent filter={filter} onChange={handleFilterChange} />
          </Paper>
        </Grid>
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
                  data={rows || []}
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

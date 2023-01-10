import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { ExecuteSetupResponse } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppAction, AppActions } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { SystemSetupResultComponent } from "../../components/SystemSetupResultComponent";
import { SystemSetupStatusComponent } from "../../components/SystemSetupStatusComponent";
import { backendApiUrl } from "../../configuration/Urls";
import {
  ExecuteState,
  useExecuteSystemSetup,
} from "../../hooks/useExecuteSystemSetup";
import { useSystemSetupStatus } from "../../hooks/useSystemSetupStatus";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const setupStatusApiResponse = useSystemSetupStatus(
    backendApiUrl,
    updateIndicator
  );

  const { response: status } = setupStatusApiResponse;

  const [execution, setExecution] = useState<{
    setupResult: ExecuteSetupResponse["setup"] | undefined;
    state: ExecuteState;
  }>({ setupResult: undefined, state: "not started" });

  const setupExecutionApiResponse = useExecuteSystemSetup(
    backendApiUrl,
    execution.state
  );
  const { response: setupExecutionResponse } = setupExecutionApiResponse;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.setupStatus = setupStatusApiResponse;
    newData.setupExecution = setupExecutionApiResponse;
    return newData;
  }, [setupStatusApiResponse, setupExecutionApiResponse]);

  useEffect(() => {
    setExecution({ setupResult: setupExecutionResponse, state: "not started" });
  }, [setupExecutionResponse]);

  const startSetup = useCallback(() => {
    setExecution({ setupResult: undefined, state: "start" });
  }, []);

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

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
    newActions.push({ label: "SETUP", onClick: startSetup });
    return newActions;
  }, [refreshStatus, startSetup]);

  const { setupResult } = execution;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System Setup"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      {setupResult && (
        <Grid item>
          <Paper>
            <SystemSetupResultComponent setupResult={setupResult} />
          </Paper>
        </Grid>
      )}
      <Grid item>
        <Paper>
          <SystemSetupStatusComponent status={status} />
        </Paper>
      </Grid>
    </Grid>
  );
};

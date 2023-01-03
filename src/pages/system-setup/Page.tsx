import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { ExecuteSetupResponse } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppAction, AppActions } from "../../components/AppActions";
import { ErrorDisplay } from "../../components/ErrorDisplay";
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
  const {
    response: status,
    error: statusError,
    errorCode: statusErrorCode,
  } = useSystemSetupStatus(backendApiUrl, updateIndicator);
  const [execution, setExecution] = useState<{
    setupResult: ExecuteSetupResponse["setup"] | undefined;
    state: ExecuteState;
  }>({ setupResult: undefined, state: "not started" });

  const {
    response: setupResponse,
    error: setupError,
    errorCode: setupErrorCode,
  } = useExecuteSystemSetup(backendApiUrl, execution.state);

  useEffect(() => {
    setExecution({ setupResult: setupResponse, state: "not started" });
  }, [setupResponse]);

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
        <Paper>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      <Grid item>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Paper>
              <ErrorDisplay error={setupError} errorCode={setupErrorCode} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper>
              <ErrorDisplay error={statusError} errorCode={statusErrorCode} />
            </Paper>
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
      </Grid>
    </Grid>
  );
};

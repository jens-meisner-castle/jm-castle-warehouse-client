import { Grid, Paper, Typography } from "@mui/material";
import { ExecuteSetupResponse } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppAction, AppActions } from "../../components/AppActions";
import { SystemSetupResultComponent } from "../../components/SystemSetupResultComponent";
import { SystemSetupStatusComponent } from "../../components/SystemSetupStatusComponent";
import { TextareaComponent } from "../../components/TextareaComponent";
import { TextComponent } from "../../components/TextComponent";
import { backendApiUrl } from "../../configuration/Urls";
import {
  ExecuteState,
  useExecuteSystemSetup,
} from "../../hooks/useExecuteSystemSetup";
import { useSystemSetupStatus } from "../../hooks/useSystemSetupStatus";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const { status, error: statusError } = useSystemSetupStatus(
    backendApiUrl,
    updateIndicator
  );
  const [execution, setExecution] = useState<{
    setupResult: ExecuteSetupResponse["setup"] | undefined;
    state: ExecuteState;
  }>({ setupResult: undefined, state: "not started" });

  const { setup: hookResult, error: setupError } = useExecuteSystemSetup(
    backendApiUrl,
    execution.state
  );

  useEffect(() => {
    setExecution({ setupResult: hookResult, state: "not started" });
  }, [hookResult]);

  const startSetup = useCallback(() => {
    setExecution({ setupResult: undefined, state: "start" });
  }, []);
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({ label: "Refresh", onClick: refreshStatus });
    newActions.push({ label: "SETUP", onClick: startSetup });
    return newActions;
  }, [refreshStatus, startSetup]);

  const leftColumnWidth = 200;
  const { setupResult } = execution;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System (setup) status"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      {setupError && (
        <Grid item>
          <Paper>
            <Grid container direction="row">
              <Grid item style={{ width: leftColumnWidth }}>
                <Typography>{"Setup error"}</Typography>
              </Grid>
              <Grid item flexGrow={1}>
                <TextareaComponent
                  value={setupError}
                  maxRows={10}
                  style={{
                    width: "90%",
                    resize: "none",
                    marginRight: 30,
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
      {statusError && (
        <Grid item>
          <Paper>
            <Grid container direction="row">
              <Grid item style={{ width: leftColumnWidth }}>
                <Typography>{"Status error"}</Typography>
              </Grid>
              <Grid item>
                <TextComponent value={statusError} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
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

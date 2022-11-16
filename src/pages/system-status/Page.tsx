import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { AppAction, AppActions } from "../../components/AppActions";
import { SystemStatusComponent } from "../../components/SystemStatusComponent";
import { TextComponent } from "../../components/TextComponent";
import { backendApiUrl } from "../../configuration/Urls";
import {
  ControlAction,
  useSystemControls,
} from "../../hooks/useSystemControls";
import { useSystemStatus } from "../../hooks/useSystemStatus";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const { status, error: statusError } = useSystemStatus(
    backendApiUrl,
    updateIndicator
  );
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const [action, setAction] = useState<ControlAction>("none");
  const {
    action: actionInProgress,
    error: actionError,
    response: actionResponse,
  } = useSystemControls(backendApiUrl, action);
  const isWaitingForActionResponse =
    actionInProgress !== action ||
    (action !== "none" && !actionError && !actionResponse);
  const restartSystem = useCallback(() => {
    setAction("restart");
  }, []);
  const currentActionFeedback = isWaitingForActionResponse
    ? `waiting for response to ${actionInProgress}`
    : actionInProgress !== "none"
    ? `response for ${actionInProgress} was ${
        actionResponse?.error || actionResponse?.success
      }`
    : "no action in progress";

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({ label: "Refresh", onClick: refreshStatus });
    newActions.push({
      label: "Restart",
      onClick: restartSystem,
      disabled: isWaitingForActionResponse,
    });
    return newActions;
  }, [refreshStatus, restartSystem, isWaitingForActionResponse]);

  const leftColumnWidth = 200;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System status"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      {isWaitingForActionResponse && (
        <Grid item>
          <Paper>
            <Typography>{currentActionFeedback}</Typography>
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
      <Grid item>
        <SystemStatusComponent status={status} />
      </Grid>
    </Grid>
  );
};

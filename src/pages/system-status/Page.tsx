import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useSetTokenHasExpired } from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { SystemStatusComponent } from "../../components/SystemStatusComponent";
import { TextareaComponent } from "../../components/TextareaComponent";
import { backendApiUrl } from "../../configuration/Urls";
import {
  ControlAction,
  useSystemControls,
} from "../../hooks/useSystemControls";
import { useSystemStatus } from "../../hooks/useSystemStatus";

export const Page = () => {
  const handleExpiredToken = useSetTokenHasExpired();
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const {
    response: status,
    error: statusError,
    errorCode: statusErrorCode,
  } = useSystemStatus(backendApiUrl, updateIndicator, handleExpiredToken);
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
    newActions.push({
      label: (
        <Tooltip title="Daten aktualisieren">
          <RefreshIcon />
        </Tooltip>
      ),
      onClick: refreshStatus,
    });
    newActions.push({
      label: (
        <Tooltip title="System neu starten">
          <RestartAltIcon />
        </Tooltip>
      ),
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
      {statusErrorCode && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error code"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <Typography>{statusErrorCode}</Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      {statusError && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={statusError}
                maxRows={10}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid item>
        <SystemStatusComponent status={status} />
      </Grid>
    </Grid>
  );
};

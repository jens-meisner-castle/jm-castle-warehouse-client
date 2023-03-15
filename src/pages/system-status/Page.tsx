import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { SystemStatusComponent } from "../../components/SystemStatusComponent";
import { backendApiUrl } from "../../configuration/Urls";
import {
  ControlAction,
  useSystemControls,
} from "../../hooks/useSystemControls";
import { useSystemStatus } from "../../hooks/useSystemStatus";
import { BackupPart } from "./parts/BackupPart";
import { ExportPart } from "./parts/ExportPart";
import { ImportPart } from "./parts/ImportPart";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(1);

  const systemStatusApiResponse = useSystemStatus(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: status } = systemStatusApiResponse;
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const [action, setAction] = useState<ControlAction>("none");

  const systemControlsApiResponse = useSystemControls(backendApiUrl, action);
  const {
    action: actionInProgress,
    error: actionError,
    response: actionResponse,
  } = systemControlsApiResponse;

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

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.systemStatus = systemStatusApiResponse;
    newData.systemControls = systemControlsApiResponse;
    return newData;
  }, [systemStatusApiResponse, systemControlsApiResponse]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
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

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
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
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper>
          <SystemStatusComponent status={status} />
        </Paper>
      </Grid>
      <Grid item>
        <Paper style={{ marginTop: 5 }}>
          <BackupPart />
        </Paper>
      </Grid>
      <Grid item>
        <Paper style={{ marginTop: 5 }}>
          <ExportPart />
        </Paper>
      </Grid>
      <Grid item>
        <Paper style={{ marginTop: 5 }}>
          <ImportPart />
        </Paper>
      </Grid>
    </Grid>
  );
};

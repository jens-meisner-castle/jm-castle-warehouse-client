import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import { Grid, Paper, Typography } from "@mui/material";
import {
  AppAction,
  AppActions,
  TextareaComponent,
} from "jm-castle-components/build";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { backendApiUrl } from "../../configuration/Urls";
import { useSystemBackup } from "../../hooks/useSystemBackup";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(0);

  const backupApiResponse = useSystemBackup(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: backupResponse } = backupApiResponse;

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.backup = backupApiResponse;
    return newData;
  }, [backupApiResponse]);

  const { version, file } = backupResponse || {};

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <DriveFileMoveIcon />,
      tooltip: "Backup erzeugen",
      disabled: !!updateIndicator && !file,
      onClick: () => setUpdateIndicator((previous) => previous + 1),
    });
    return newActions;
  }, [file, updateIndicator]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"System Sicherung"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper>
          <TextareaComponent
            value={file ? { version, file } : ""}
            formatObject
            maxRows={50}
            style={{
              width: "90%",
              resize: "none",
              marginRight: 30,
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

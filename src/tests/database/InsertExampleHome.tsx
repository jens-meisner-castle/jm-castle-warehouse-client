import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Grid, Typography } from "@mui/material";
import {
  AppAction,
  AppActions,
  TextareaComponent,
} from "jm-castle-components/build";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { backendApiUrl } from "../../configuration/Urls";
import { useExampleCreate } from "../../hooks/useExampleCreate";

export const InsertExampleHome = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [indicatorSelect, setIndicatorSelect] = useState(0);
  const [name, setName] = useState<string | undefined>(undefined);
  const { error, response, errorDetails } = useExampleCreate(
    backendApiUrl,
    name,
    indicatorSelect,
    handleExpiredToken
  );
  const { result } = response || {};
  const executeTest = useCallback(() => {
    setName("home");
    setIndicatorSelect((previous) => previous + 1);
  }, []);
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <PlayCircleFilledIcon />,
      onClick: executeTest,
    });
    return newActions;
  }, [executeTest]);
  const leftColumnWidth = 200;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Test: Create example 'home'."}</Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Controls"}</Typography>
          </Grid>
          <Grid item>
            <AppActions actions={actions} />
          </Grid>
        </Grid>
      </Grid>
      {error && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={error}
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
      {errorDetails && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error details"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={errorDetails}
                formatObject
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
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Result (rows)"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={result || ""}
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
    </Grid>
  );
};

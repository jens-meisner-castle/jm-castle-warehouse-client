import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Grid, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { TextareaComponent } from "../../components/TextareaComponent";
import { backendApiUrl } from "../../configuration/Urls";
import { useStoreSelect } from "../../hooks/useStoreSelect";

export const SelectFromStore = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [indicatorSelect, setIndicatorSelect] = useState(0);
  const { error, response, errorDetails, errorCode } = useStoreSelect(
    backendApiUrl,
    undefined,
    indicatorSelect,
    handleExpiredToken
  );
  const { result } = response || {};
  const { rows, cmd } = result || {};
  const executeTest = useCallback(() => {
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
        <Typography variant="h5">{"Test: Select from store"}</Typography>
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
      {errorCode && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error code"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <Typography>{errorCode}</Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
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
            <Typography>{"Command"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={cmd || ""}
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
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Result (count of rows)"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <Typography>{rows ? rows.length : 0}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Result (rows)"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={rows || ""}
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
    </Grid>
  );
};

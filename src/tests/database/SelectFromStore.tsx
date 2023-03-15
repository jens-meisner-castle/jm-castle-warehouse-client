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
import { useMasterdata } from "../../hooks/pagination/useMasterdata";

export const SelectFromStore = () => {
  const handleExpiredToken = useHandleExpiredToken();

  const [indicatorSelect, setIndicatorSelect] = useState(0);

  const { errors, rows } = useMasterdata(
    backendApiUrl,
    { store: true },
    indicatorSelect,
    handleExpiredToken
  );

  const { storeRows } = rows || {};

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
      {errors.store && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={errors.store}
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
            <Typography>{"Result (count of rows)"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <Typography>{storeRows ? storeRows.length : 0}</Typography>
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
              value={storeRows || ""}
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

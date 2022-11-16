import { Grid, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { AppAction, AppActions } from "../../components/AppActions";
import { TextareaComponent } from "../../components/TextareaComponent";
import { TextComponent } from "../../components/TextComponent";
import { backendApiUrl } from "../../configuration/Urls";
import { useStoreSelect } from "../../hooks/useStoreSelect";

export const SelectFromStore = () => {
  const [indicatorSelect, setIndicatorSelect] = useState(0);
  const { error, result, errorDetails } = useStoreSelect(
    backendApiUrl,
    undefined,
    indicatorSelect
  );
  const { rows, cmd } = result || {};
  const executeTest = useCallback(() => {
    setIndicatorSelect((previous) => (previous > 0 ? previous : previous + 1));
  }, []);
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Execute",
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
      {error && (
        <Grid item>
          <TextComponent value={error} fullWidth multiline />
          {errorDetails && (
            <TextComponent value={errorDetails} fullWidth multiline />
          )}
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

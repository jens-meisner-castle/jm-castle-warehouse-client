import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { AppAction, AppActions } from "../../../components/AppActions";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import { Articles } from "./parts/Articles";
import { Stores } from "./parts/Stores";
import { StoreSections } from "./parts/StoreSections";

export const pageUrl = "/masterdata/main";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);
  const { result: articleResult, error: articleError } = useArticleSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { result: storeResult, error: storeError } = useStoreSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { result: storeSectionResult, error: storeSectionError } =
    useStoreSectionSelect(backendApiUrl, "%", updateIndicator);
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Refresh",
      onClick: refreshStatus,
    });
    return newActions;
  }, [refreshStatus]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Stammdaten"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      {articleError && (
        <Grid item>
          <Paper>
            <Typography>{articleError}</Typography>
          </Paper>
        </Grid>
      )}
      {storeError && (
        <Grid item>
          <Paper>
            <Typography>{storeError}</Typography>
          </Paper>
        </Grid>
      )}
      {storeSectionError && (
        <Grid item>
          <Paper>
            <Typography>{storeSectionError}</Typography>
          </Paper>
        </Grid>
      )}
      <Grid item>
        <Grid container direction="row">
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Stores stores={storeResult ? storeResult.rows : []} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <StoreSections
                sections={storeSectionResult ? storeSectionResult.rows : []}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Articles articles={articleResult ? articleResult.rows : []} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

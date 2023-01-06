import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useHashtagSelect } from "../../../hooks/useHashtagSelect";
import { useImageContentRows } from "../../../hooks/useImageContentRows";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import { Articles } from "./parts/Articles";
import { Hashtags } from "./parts/Hashtags";
import { Images } from "./parts/Images";
import { Stores } from "./parts/Stores";
import { StoreSections } from "./parts/StoreSections";

export const pageUrl = "/masterdata/main";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);
  const { response: articleResponse, error: articleError } = useArticleSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { result: articleResult } = articleResponse || {};
  const { response: storeResponse, error: storeError } = useStoreSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { result: storeResult } = storeResponse || {};
  const { response: storeSectionResponse, error: storeSectionError } =
    useStoreSectionSelect(
      backendApiUrl,
      "%",
      updateIndicator,
      handleExpiredToken
    );
  const { result: storeSectionResult } = storeSectionResponse || {};
  const { response: imageContentResponse, error: imageContentError } =
    useImageContentRows(
      backendApiUrl,
      "%",
      updateIndicator,
      handleExpiredToken
    );
  const { result: imageContentResult } = imageContentResponse || {};
  const { response: hashtagResponse, error: hashtagError } = useHashtagSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { result: hashtagResult } = hashtagResponse || {};
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
    return newActions;
  }, [refreshStatus]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Stammdaten"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
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
      {imageContentError && (
        <Grid item>
          <Paper>
            <Typography>{imageContentError}</Typography>
          </Paper>
        </Grid>
      )}
      {hashtagError && (
        <Grid item>
          <Paper>
            <Typography>{hashtagError}</Typography>
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
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Images
                images={imageContentResult ? imageContentResult.rows : []}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Hashtags hashtags={hashtagResult ? hashtagResult.rows : []} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useHashtagSelect } from "../../../hooks/useHashtagSelect";
import { useImageContentRows } from "../../../hooks/useImageContentRows";
import { useReceiverSelect } from "../../../hooks/useReceiverSelect";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import { Articles } from "./parts/Articles";
import { Hashtags } from "./parts/Hashtags";
import { Images } from "./parts/Images";
import { Receivers } from "./parts/Receivers";
import { Stores } from "./parts/Stores";
import { StoreSections } from "./parts/StoreSections";

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);
  const articleApiResponse = useArticleSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};

  const storeApiResponse = useStoreSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: storeResponse } = storeApiResponse;
  const { result: storeResult } = storeResponse || {};
  const storeSectionApiResponse = useStoreSectionSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: storeSectionResponse } = storeSectionApiResponse;
  const { result: storeSectionResult } = storeSectionResponse || {};
  const imageContentApiResponse = useImageContentRows(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: imageContentResponse } = imageContentApiResponse;
  const { result: imageContentResult } = imageContentResponse || {};
  const hashtagApiResponse = useHashtagSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: hashtagResponse } = hashtagApiResponse;
  const { result: hashtagResult } = hashtagResponse || {};

  const receiverApiResponse = useReceiverSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: receiverResponse } = receiverApiResponse;
  const { result: receiverResult } = receiverResponse || {};

  const errorData = useMemo(() => {
    const newErrors: Record<string, ErrorData> = {};
    newErrors.article = { ...articleApiResponse };
    newErrors.store = { ...storeApiResponse };
    newErrors.storeSection = { ...storeSectionApiResponse };
    newErrors.imageContent = { ...imageContentApiResponse };
    newErrors.hashtag = { ...hashtagApiResponse };
    newErrors.receiver = { ...receiverApiResponse };

    return newErrors;
  }, [
    articleApiResponse,
    storeApiResponse,
    storeSectionApiResponse,
    imageContentApiResponse,
    hashtagApiResponse,
    receiverApiResponse,
  ]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
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
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
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
              <Receivers
                receivers={receiverResult ? receiverResult.rows : []}
              />
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

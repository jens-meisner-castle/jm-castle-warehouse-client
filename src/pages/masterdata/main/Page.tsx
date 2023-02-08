import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { useAttributeSelect } from "../../../hooks/useAttributeSelect";
import { useCostunitSelect } from "../../../hooks/useCostunitSelect";
import { useHashtagSelect } from "../../../hooks/useHashtagSelect";
import { useImageContentRows } from "../../../hooks/useImageContentRows";
import { useManufacturerSelect } from "../../../hooks/useManufacturerSelect";
import { useReceiverSelect } from "../../../hooks/useReceiverSelect";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import { Articles } from "./parts/Articles";
import { Attributes } from "./parts/Attributes";
import { Costunits } from "./parts/Costunits";
import { Hashtags } from "./parts/Hashtags";
import { Images } from "./parts/Images";
import { Manufacturers } from "./parts/Manufacturers";
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

  const costunitApiResponse = useCostunitSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: costunitResponse } = costunitApiResponse;
  const { result: costunitResult } = costunitResponse || {};

  const receiverApiResponse = useReceiverSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: receiverResponse } = receiverApiResponse;
  const { result: receiverResult } = receiverResponse || {};

  const manufacturerApiResponse = useManufacturerSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: manufacturerResponse } = manufacturerApiResponse;
  const { result: manufacturerResult } = manufacturerResponse || {};

  const attributeApiResponse = useAttributeSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: attributeResponse } = attributeApiResponse;
  const { result: attributeResult } = attributeResponse || {};

  const errorData = useMemo(() => {
    const newErrors: Record<string, ErrorData> = {};
    newErrors.article = { ...articleApiResponse };
    newErrors.store = { ...storeApiResponse };
    newErrors.storeSection = { ...storeSectionApiResponse };
    newErrors.imageContent = { ...imageContentApiResponse };
    newErrors.hashtag = { ...hashtagApiResponse };
    newErrors.costunit = { ...costunitApiResponse };
    newErrors.receiver = { ...receiverApiResponse };
    newErrors.manufacturer = { ...manufacturerApiResponse };
    newErrors.attribute = { ...attributeApiResponse };

    return newErrors;
  }, [
    articleApiResponse,
    storeApiResponse,
    storeSectionApiResponse,
    imageContentApiResponse,
    hashtagApiResponse,
    receiverApiResponse,
    costunitApiResponse,
    manufacturerApiResponse,
    attributeApiResponse,
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
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Costunits
                costunits={costunitResult ? costunitResult.rows : []}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Manufacturers
                manufacturers={
                  manufacturerResult ? manufacturerResult.rows : []
                }
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Attributes
                attributes={attributeResult ? attributeResult.rows : []}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

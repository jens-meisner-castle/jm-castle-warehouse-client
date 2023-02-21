import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { TableName } from "jm-castle-warehouse-types/build";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../configuration/Urls";
import { useTablesCount } from "../../../hooks/useTablesCount";
import { Articles } from "./parts/Articles";
import { Attributes } from "./parts/Attributes";
import { Costunits } from "./parts/Costunits";
import { Hashtags } from "./parts/Hashtags";
import { Images } from "./parts/Images";
import { Manufacturers } from "./parts/Manufacturers";
import { Receivers } from "./parts/Receivers";
import { Stores } from "./parts/Stores";
import { StoreSections } from "./parts/StoreSections";

const tablenameArr: TableName[] = [
  "article",
  "attribute",
  "costunit",
  "hashtag",
  "image_content",
  "manufacturer",
  "receiver",
  "store",
  "store_section",
];

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const countApiResponse = useTablesCount(
    backendApiUrl,
    tablenameArr,
    updateIndicator,
    handleExpiredToken
  );

  const handleNewMasterdata = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const counts = useMemo(() => {
    const newCounts: Partial<Record<TableName, number>> = {};
    const { response } = countApiResponse;
    response?.forEach(
      (res) =>
        res.result &&
        res.result.row &&
        (newCounts[res.result.row.table as TableName] =
          res.result.row.countOfRows)
    );
    return newCounts;
  }, [countApiResponse]);

  const errorData = useMemo(() => {
    const newErrors: Record<string, ErrorData> = {};
    newErrors.count = { ...countApiResponse };
    return newErrors;
  }, [countApiResponse]);

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
              <Stores count={counts.store || 0} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <StoreSections count={counts.store_section || 0} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Articles
                count={counts.article || 0}
                onNew={handleNewMasterdata}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Receivers count={counts.receiver || 0} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Images
                count={counts.image_content || 0}
                onNew={handleNewMasterdata}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Hashtags count={counts.hashtag || 0} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Costunits count={counts.costunit || 0} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Manufacturers count={counts.manufacturer || 0} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Attributes count={counts.attribute || 0} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

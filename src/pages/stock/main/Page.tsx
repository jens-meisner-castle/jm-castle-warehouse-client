import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeintervalFilter } from "../../../filter/Types";
import { useEmissionSelect } from "../../../hooks/useEmissionSelect";
import { useReceiptSelect } from "../../../hooks/useReceiptSelect";
import { getNewFilter } from "../../../utils/Filter";
import { Emissions } from "./parts/Emissions";
import { Receipts } from "./parts/Receipts";

export const pageUrl = "/stock/main";

export const Page = () => {
  const [filter] = useState<TimeintervalFilter>(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }),
      to: DateTime.now(),
    })
  );
  const handleExpiredToken = useHandleExpiredToken();
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);
  const receiptApiResponse = useReceiptSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: receiptResponse } = receiptApiResponse;
  const { result: receiptResult } = receiptResponse || {};
  const { rows: receiptRows } = receiptResult || {};

  const emissionApiResponse = useEmissionSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: emissionResponse } = emissionApiResponse;
  const { result: emissionResult } = emissionResponse || {};
  const { rows: emissionRows } = emissionResult || {};

  const errorData = useMemo(() => {
    const newErrors: Record<string, ErrorData> = {};
    newErrors.receipt = { ...receiptApiResponse };
    newErrors.emission = { ...emissionApiResponse };
    return newErrors;
  }, [receiptApiResponse, emissionApiResponse]);

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
        <Typography variant="h5">{"Bestand"}</Typography>
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
              <Receipts receipts={receiptRows || []} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              style={{ padding: 5, margin: 5, marginTop: 0, marginLeft: 0 }}
            >
              <Emissions emissions={emissionRows || []} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

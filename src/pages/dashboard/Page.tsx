import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { Grid, Paper, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { DateTime } from "luxon";
import { useCallback, useMemo, useRef, useState } from "react";
import { TimeintervalFilter } from "../../filter/Types";
import { allRoutes } from "../../navigation/AppRoutes";
import {
  loadOptionsForPage,
  storeOptionsForPage,
} from "../../utils/LocalStorage";
import { ExtensionUser } from "../../web-components/ExtensionUser";
import { MasterdataChanges } from "./parts/MasterdataChanges";
import { PageOptions, getNewOptions } from "./parts/OptionsComponent";
import { OptionsMenu } from "./parts/OptionsMenu";
import { Receipts } from "./parts/Receipts";

export const Page = () => {
  const [pageOptions, setPageOptions] = useState(
    getNewOptions(loadOptionsForPage(allRoutes().dashboard.path) || {})
  );
  const { isIncomingHistoryVisible, isMasterdataChangesVisible } = pageOptions;

  const handleNewOptions = useCallback((newOptions: Partial<PageOptions>) => {
    let mergedOptions: PageOptions | Partial<PageOptions> = {};
    setPageOptions((previous) => {
      mergedOptions = { ...previous, ...newOptions };
      return { ...previous, ...newOptions };
    });
    mergedOptions &&
      storeOptionsForPage(mergedOptions, allRoutes().dashboard.path);
  }, []);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsSelectionRef = useRef<HTMLButtonElement | null>(null);
  const [filter, setFilter] = useState<TimeintervalFilter>({
    from: DateTime.now().minus({ day: 7 }).startOf("day"),
    to: DateTime.now().endOf("day"),
  });

  const refreshStatus = useCallback(() => {
    setFilter({
      from: DateTime.now().minus({ day: 1 }).startOf("day"),
      to: DateTime.now().endOf("day"),
    });
  }, []);
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push({
      label: <SettingsApplicationsIcon />,
      onClick: () => setIsOptionsVisible((previous) => !previous),
      elementRef: optionsSelectionRef,
    });
    return newActions;
  }, [refreshStatus]);

  return (
    <>
      {isOptionsVisible && (
        <OptionsMenu
          options={pageOptions}
          onChange={handleNewOptions}
          onClose={() => setIsOptionsVisible(false)}
          anchorEl={optionsSelectionRef.current}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Dashboard"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        <Grid item>
          <ExtensionUser />
        </Grid>
        <Grid item>
          <Grid container direction="row" gap={1}>
            {isMasterdataChangesVisible && (
              <Grid item>
                <MasterdataChanges filter={filter} sizeVariant="tiny" />
              </Grid>
            )}
            {isIncomingHistoryVisible && (
              <Grid item>
                <Receipts filter={filter} sizeVariant="tiny" />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

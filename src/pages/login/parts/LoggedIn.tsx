import { Grid, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../components/AppActions";

export interface LoggedInProps {
  user: string;
  tokenHasExpired: boolean;
  expiresAtMs: number;
  onLogout: () => void;
  disableLogout: boolean;
}

export const LoggedIn = (props: LoggedInProps) => {
  const { user, tokenHasExpired, expiresAtMs, onLogout, disableLogout } = props;

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Logout",
      onClick: onLogout,
      disabled: disableLogout,
    });
    return newActions;
  }, [onLogout, disableLogout]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Eingeloggt als ${user}`}</Typography>
      </Grid>
      <Grid item>
        <Typography>{`Gültig bis: ${DateTime.fromMillis(expiresAtMs).toFormat(
          "yyyy-LL-dd HH:mm:ss"
        )}`}</Typography>
      </Grid>
      {tokenHasExpired && (
        <Grid item>
          <Typography>{`Das Token ist abgelaufen. Bitte loggen Sie sich erneut ein.`}</Typography>
        </Grid>
      )}
      <Grid item>
        <div style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </div>
      </Grid>
    </Grid>
  );
};

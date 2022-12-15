import { Alert, Grid, Paper, TextField, Typography } from "@mui/material";
import { DateTime } from "luxon";
import {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLoginResult,
  useResetLoginResult,
  useSetLoginResult,
  useTokenHasExpired,
} from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { backendApiUrl } from "../../configuration/Urls";
import { LoginData, useLogin } from "../../hooks/useLogin";

export const Page = () => {
  const [loginData, setLoginData] = useState<
    LoginData & { updateTrigger: number }
  >({ user: "", password: "", updateTrigger: 0 });
  const { updateTrigger } = loginData;
  const loginResponse = useLogin(
    backendApiUrl,
    loginData.updateTrigger ? loginData : undefined
  );
  const { response: loginResult } = loginResponse || {};
  const tryLogin = useCallback(
    () =>
      setLoginData((previous) => ({
        ...previous,
        updateTrigger: previous.updateTrigger + 1,
      })),
    []
  );
  const setLoginResult = useSetLoginResult();
  const resetLoginResult = useResetLoginResult();
  const tryLogout = resetLoginResult;
  const contextLoginResult = useLoginResult();
  const tokenHasExpired = useTokenHasExpired();
  const { username: contextUser, expiresAtMs } = contextLoginResult || {};
  const handlePasswordKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      tryLogin();
    }
  };

  useEffect(() => {
    if (loginResult && loginResult.token) {
      setLoginData({ user: "", password: "", updateTrigger: 0 });
      setLoginResult(loginResult);
    }
  }, [loginResult, setLoginResult]);
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    !contextUser &&
      newActions.push({
        label: "Login",
        onClick: tryLogin,
        disabled: updateTrigger !== 0,
      });
    contextUser &&
      newActions.push({
        label: "Logout",
        onClick: tryLogout,
        disabled: updateTrigger !== 0,
      });
    return newActions;
  }, [tryLogin, tryLogout, updateTrigger, contextUser]);
  const { token, error, username, roles } = loginResult || {};
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Login"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <Grid container direction="column">
            {contextUser && (
              <Grid item>
                <Typography>{`Eingeloggt als ${contextUser}`}</Typography>
              </Grid>
            )}
            {expiresAtMs && (
              <Grid item>
                <Typography>{`Gültig bis: ${DateTime.fromMillis(
                  expiresAtMs
                ).toFormat("yyyy-LL-dd HH:mm:ss")}`}</Typography>
              </Grid>
            )}
            {tokenHasExpired && (
              <Grid item>
                <Typography>{`Das Token ist abgelaufen. Bitte loggen Sie sich erneut ein.`}</Typography>
              </Grid>
            )}
            {!contextUser && (
              <Grid item>
                <TextField
                  autoFocus
                  margin="dense"
                  id="username"
                  label="Benutzer"
                  value={loginData.user}
                  onChange={(event) =>
                    setLoginData((previous) => ({
                      ...previous,
                      updateTrigger: 0,
                      user: event.target.value,
                    }))
                  }
                  type="text"
                  fullWidth
                  variant="standard"
                />
              </Grid>
            )}
            {!contextUser && (
              <Grid item>
                <TextField
                  margin="dense"
                  id="password"
                  label="Passwort"
                  value={loginData.password}
                  onKeyDown={handlePasswordKeyDown}
                  onChange={(event) =>
                    setLoginData((previous) => ({
                      ...previous,
                      updateTrigger: 0,
                      password: event.target.value,
                    }))
                  }
                  type="password"
                  fullWidth
                  variant="standard"
                />
              </Grid>
            )}
            <Grid item>
              <AppActions actions={actions} />
            </Grid>
            {error && (
              <Grid item>
                <Alert severity="error">{`Fehler beim Login: ${error}`}</Alert>
              </Grid>
            )}
            {token && username && roles && (
              <Grid item>
                <Alert severity="success">{`Sie haben sich erfolgreich eingeloggt.
                User: ${username},
                Roles: ${roles.join(", ")}`}</Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

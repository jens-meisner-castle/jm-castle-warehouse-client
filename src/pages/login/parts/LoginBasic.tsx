import { Grid, TextField } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { KeyboardEventHandler, useCallback, useMemo } from "react";
import { LoginData } from "../../../hooks/useLoginBasic";

export interface LoginBasicProps {
  loginData: LoginData;
  onChangeLoginData: (data: LoginData) => void;
  onLogin: () => void;
  disableLogin: boolean;
}

export const LoginBasic = (props: LoginBasicProps) => {
  const { loginData, onChangeLoginData, onLogin, disableLogin } = props;
  const { user, password } = loginData;

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Login",
      onClick: onLogin,
      disabled: disableLogin || !user,
    });
    return newActions;
  }, [onLogin, disableLogin, user]);

  const handlePasswordKeyDown: KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        if (event.key === "Enter") {
          onLogin();
        }
      },
      [onLogin]
    );

  return (
    <Grid container direction="column">
      <Grid item>
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Benutzer"
          value={user}
          onChange={(event) =>
            onChangeLoginData({
              password: password,
              user: event.target.value,
            })
          }
          type="text"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid item>
        <TextField
          margin="dense"
          id="password"
          label="Passwort"
          value={password}
          onKeyDown={handlePasswordKeyDown}
          onChange={(event) =>
            onChangeLoginData({
              user: user,
              password: event.target.value,
            })
          }
          type="password"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid item>
        <div style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </div>
      </Grid>
    </Grid>
  );
};

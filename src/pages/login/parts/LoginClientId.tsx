import { Grid, TextField } from "@mui/material";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../components/AppActions";
import { loadClientId } from "../../../utils/LocalStorage";

export interface LoginClientIdProps {
  clientId: string;
  onChangeClientId: (clientId: string) => void;
  onLogin: () => void;
  onResetClientId: () => void;
  disableLogin: boolean;
}

export const LoginClientId = (props: LoginClientIdProps) => {
  const { clientId, onChangeClientId, onResetClientId, onLogin, disableLogin } =
    props;

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Login",
      onClick: onLogin,
      disabled: disableLogin || !clientId,
    });
    newActions.push({
      label: "Client ID zurücksetzen",
      onClick: onResetClientId,
      disabled: disableLogin || !loadClientId(),
    });
    return newActions;
  }, [onLogin, disableLogin, clientId, onResetClientId]);

  return (
    <Grid container direction="column">
      <Grid item>
        <TextField
          autoFocus
          margin="dense"
          id="clientId"
          label="Client ID"
          value={clientId}
          onChange={(event) => onChangeClientId(event.target.value)}
          type="text"
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

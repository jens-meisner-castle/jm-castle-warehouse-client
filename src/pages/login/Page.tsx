import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import {
  useHandleChangedClientId,
  useHandleLoginResult,
  useHandleLogoutResult,
  useTokenHasExpired,
  useVerifiedUser,
} from "../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { backendApiUrl } from "../../configuration/Urls";
import { LoginData, useLoginBasic } from "../../hooks/useLoginBasic";
import { useLoginClient } from "../../hooks/useLoginClient";
import { loadClientId, storeClientId } from "../../utils/LocalStorage";
import { LoggedIn } from "./parts/LoggedIn";
import { LoginBasic } from "./parts/LoginBasic";
import { LoginClientId } from "./parts/LoginClientId";

export const Page = () => {
  const [basicLoginData, setBasicLoginData] = useState<
    LoginData & { updateTrigger: number }
  >({ user: "", password: "", updateTrigger: 0 });

  const [clientLoginData, setClientLoginData] = useState<{
    clientId: string | undefined;
    updateTrigger: number;
  }>({ clientId: loadClientId(), updateTrigger: 0 });

  const [authType, setAuthType] = useState<"basic" | "client">("basic");

  const handleChangedAuthType = useCallback((value: string) => {
    setAuthType(value === "basic" ? "basic" : "client");
    setErrorData({});
  }, []);

  const { updateTrigger: basicLoginTrigger } = basicLoginData;
  const { clientId } = clientLoginData;

  const basicLoginApiResponse = useLoginBasic(
    backendApiUrl,
    basicLoginTrigger ? basicLoginData : undefined
  );
  const { response: basicLoginResult } = basicLoginApiResponse || {};

  const tryBasicLogin = useCallback(
    () =>
      setBasicLoginData((previous) => ({
        ...previous,
        updateTrigger: previous.updateTrigger + 1,
      })),
    []
  );

  const { updateTrigger: clientLoginTrigger } = clientLoginData;
  const clientLoginApiResponse = useLoginClient(
    backendApiUrl,
    clientLoginData.clientId,
    clientLoginTrigger
  );

  const { response: clientLoginResult } = clientLoginApiResponse;
  const tryClientLogin = useCallback(
    () =>
      setClientLoginData((previous) => ({
        ...previous,
        updateTrigger: previous.updateTrigger + 1,
      })),
    []
  );

  const [errorData, setErrorData] = useState<Record<string, ErrorData>>({});

  useEffect(() => {
    if (
      (basicLoginTrigger > 0 &&
        !basicLoginApiResponse.error &&
        !basicLoginApiResponse.response) ||
      (clientLoginTrigger > 0 &&
        !clientLoginApiResponse.error &&
        !clientLoginApiResponse.response)
    ) {
      // if api request in progress => cleanup errorData
      return setErrorData({});
    }
    if (basicLoginTrigger > 0 || clientLoginTrigger > 0) {
      // api request finished
      const newData: Record<string, ErrorData> = {};
      newData.basicLogin = basicLoginApiResponse;
      newData.clientLogin = clientLoginApiResponse;
      setErrorData(newData);
    }
  }, [
    basicLoginApiResponse,
    clientLoginApiResponse,
    basicLoginTrigger,
    clientLoginTrigger,
  ]);

  const handleChangedClientId = useHandleChangedClientId();
  const handleLoginResult = useHandleLoginResult();
  const handleLogoutResult = useHandleLogoutResult();
  const tryLogout = handleLogoutResult;

  const verifiedUser = useVerifiedUser();
  const tokenHasExpired = useTokenHasExpired();
  const { username: contextUser, expiresAtMs } = verifiedUser || {};

  const handleChangedBasicLoginData = useCallback((data: LoginData) => {
    setBasicLoginData({ ...data, updateTrigger: 0 });
  }, []);

  const handleChangedLocalClientId = useCallback((clientId: string) => {
    setClientLoginData({ clientId, updateTrigger: 0 });
  }, []);

  const handleResetClientId = useCallback(() => {
    storeClientId(undefined);
    setClientLoginData({ clientId: undefined, updateTrigger: 0 });
  }, []);

  useEffect(() => {
    if (basicLoginApiResponse.error) {
      setBasicLoginData((previous) => ({ ...previous, updateTrigger: 0 }));
    } else if (basicLoginResult && basicLoginResult.token) {
      setBasicLoginData({ user: "", password: "", updateTrigger: 0 });
      handleLoginResult(basicLoginResult);
    }
  }, [basicLoginResult, handleLoginResult, basicLoginApiResponse]);

  useEffect(() => {
    if (clientLoginApiResponse.error) {
      setClientLoginData((previous) => ({ ...previous, updateTrigger: 0 }));
    }
    if (clientLoginResult && clientLoginResult.token) {
      setClientLoginData((previous) => {
        return { ...previous, updateTrigger: 0 };
      });
      handleChangedClientId(clientId);
      handleLoginResult(clientLoginResult);
    }
  }, [
    clientLoginResult,
    handleChangedClientId,
    handleLoginResult,
    clientId,
    clientLoginApiResponse,
  ]);

  const disableLogout = basicLoginTrigger !== 0;
  const disableLogin = basicLoginTrigger !== 0;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Login"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <Grid container direction="column">
            {contextUser && expiresAtMs && (
              <Grid item>
                <LoggedIn
                  user={contextUser}
                  onLogout={tryLogout}
                  disableLogout={disableLogout}
                  tokenHasExpired={tokenHasExpired}
                  expiresAtMs={expiresAtMs}
                />
              </Grid>
            )}
            {!contextUser && (
              <Grid item>
                <FormControl>
                  <FormLabel id="demo-radio-buttons-group-label">
                    {"Authentifizierungsart"}
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="female"
                    name="radio-buttons-group"
                    row
                    value={authType}
                    onChange={(event, value) => handleChangedAuthType(value)}
                  >
                    <FormControlLabel
                      value="basic"
                      control={<Radio />}
                      label="Name und Passwort"
                    />
                    <FormControlLabel
                      value="client"
                      control={<Radio />}
                      label="Client ID"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}
            {!contextUser &&
              (authType === "basic" ? (
                <Grid item>
                  <LoginBasic
                    loginData={basicLoginData}
                    onChangeLoginData={handleChangedBasicLoginData}
                    disableLogin={disableLogin}
                    onLogin={tryBasicLogin}
                  />
                </Grid>
              ) : (
                <Grid item>
                  <LoginClientId
                    clientId={clientLoginData.clientId || ""}
                    onChangeClientId={handleChangedLocalClientId}
                    disableLogin={disableLogin}
                    onLogin={tryClientLogin}
                    onResetClientId={handleResetClientId}
                  />
                </Grid>
              ))}
            <Grid item>
              <ErrorDisplays results={errorData} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

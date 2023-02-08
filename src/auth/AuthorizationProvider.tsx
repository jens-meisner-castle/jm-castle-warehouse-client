import {
  ErrorCode,
  JsonWebTokenError,
  LoginResult,
  TokenExpiredErrorCode,
  TokenUndefinedErrorCode,
  UserRole,
} from "jm-castle-warehouse-types/build";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { backendApiUrl } from "../configuration/Urls";
import { useLoginClient } from "../hooks/useLoginClient";
import { useVerifyToken } from "../hooks/useVerifyToken";
import { loadClientId, storeClientId } from "../utils/LocalStorage";

interface Authorization {
  verifiedUser?: {
    username: string;
    roles: UserRole[];
    expiresAtMs: number;
    expiresAtDisplay: string;
  };
  withServiceWorker: boolean;
  token?: string;
  tokenHasExpired: boolean;
  clientId?: string;
  handleLoginResult?: (loginResult: LoginResult) => void;
  handleLogoutResult?: () => void;
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void;
  handleChangedClientId?: (clientId: string | undefined) => void;
}

const initialValue: Authorization = {
  tokenHasExpired: false,
  withServiceWorker: false,
};

const context = createContext(initialValue);

export const { Provider } = context;

export type AuthorizationProviderProps = {
  withServiceWorker: boolean;
} & PropsWithChildren;

export const AuthorizationProvider = (props: AuthorizationProviderProps) => {
  const { children, withServiceWorker } = props;
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [stateId, setStateId] = useState<
    "initial" | "try-login-client" | "try-verify-token" | "done"
  >("initial");
  const [clientId, setClientId] = useState<string | undefined>(loadClientId());

  const handleExpiredToken = useCallback((errorCode: ErrorCode | undefined) => {
    if (
      errorCode === TokenExpiredErrorCode ||
      errorCode === JsonWebTokenError ||
      errorCode === TokenUndefinedErrorCode
    ) {
      setIsTokenExpired(true);
    }
  }, []);

  const handleChangedClientId = useCallback((clientId: string | undefined) => {
    storeClientId(clientId);
    setClientId(clientId);
  }, []);

  const handleLoginResult = useCallback(
    (loginResult: LoginResult) => {
      const { token, username, roles, expiresAtDisplay, expiresAtMs } =
        loginResult || {};
      if (navigator.serviceWorker?.controller) {
        if (token && withServiceWorker) {
          navigator.serviceWorker.controller.postMessage({
            type: "SET_TOKEN",
            token: `Bearer ${token}`,
          });
        }
      }
      if (token && username && roles && expiresAtDisplay && expiresAtMs) {
        const verifiedUser = { username, roles, expiresAtDisplay, expiresAtMs };
        setProviderValue((previous) => ({
          ...previous,
          token,
          verifiedUser,
          tokenHasExpired: false,
        }));
      } else {
        setProviderValue((previous) => ({
          ...previous,
          token: undefined,
          verifiedUser: undefined,
          tokenHasExpired: false,
        }));
      }
    },
    [withServiceWorker]
  );

  useEffect(
    () =>
      setProviderValue((previous) => ({
        ...previous,
        handleLoginResult,
      })),
    [handleLoginResult]
  );

  useEffect(
    () =>
      setProviderValue((previous) =>
        previous.withServiceWorker === withServiceWorker
          ? previous
          : {
              ...previous,
              withServiceWorker,
            }
      ),
    [withServiceWorker]
  );

  const handleLogoutResult = useCallback(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "RESET_TOKEN",
      });
    }
    setProviderValue((previous) => ({
      ...previous,
      token: undefined,
      verifiedUser: undefined,
      tokenHasExpired: false,
    }));
  }, []);

  const [providerValue, setProviderValue] = useState<Authorization>({
    tokenHasExpired: isTokenExpired,
    withServiceWorker,
    clientId,
    handleLoginResult,
    handleLogoutResult,
    handleExpiredToken,
    handleChangedClientId,
  });

  // try once to login by clientId (if present) or verify token
  useEffect(() => {
    if (stateId === "initial") {
      if (clientId) {
        setStateId("try-login-client");
      } else {
        setStateId("try-verify-token");
      }
    }
  }, [stateId, clientId]);

  const { response: clientLoginResult, error: clientLoginError } =
    useLoginClient(
      backendApiUrl,
      clientId,
      stateId === "try-login-client" ? 1 : 0
    );

  useEffect(() => {
    if (clientLoginResult) {
      setStateId("done");
      handleLoginResult(clientLoginResult);
    }
  }, [clientLoginResult, handleLoginResult]);

  useEffect(() => {
    if (clientLoginError) {
      setStateId("done");
    }
  }, [clientLoginError]);

  const verifyApiResponse = useVerifyToken(
    backendApiUrl,
    stateId === "try-verify-token" ? 1 : 0
  );
  const { response: verifyResult, error: verifyError } = verifyApiResponse;

  useEffect(() => {
    if (verifyResult) {
      setStateId("done");
      const { username, roles, expiresAtDisplay, expiresAtMs } = verifyResult;
      username &&
        roles &&
        expiresAtDisplay &&
        expiresAtMs &&
        setProviderValue((previous) => ({
          ...previous,
          verifiedUser: { ...verifyResult },
        }));
    }
  }, [verifyResult]);

  useEffect(() => {
    if (verifyError) {
      setStateId("done");
    }
  }, [verifyError]);

  useEffect(() => {
    if (
      withServiceWorker &&
      isTokenExpired &&
      navigator.serviceWorker?.controller
    ) {
      navigator.serviceWorker.controller.postMessage({
        type: "RESET_TOKEN",
      });
    }
    setProviderValue((previous) => ({
      ...previous,
      tokenHasExpired: isTokenExpired,
    }));
  }, [withServiceWorker, isTokenExpired]);

  useEffect(() => {
    setProviderValue((previous) => ({
      ...previous,
      clientId,
    }));
  }, [clientId]);

  return <Provider value={providerValue}>{children}</Provider>;
};

export const useVerifiedUser = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { verifiedUser } = contextValue;
  return verifiedUser;
};

export const useUserRoles = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { verifiedUser } = contextValue;
  const { roles } = verifiedUser || {};
  return roles;
};

export const useAuthorizationToken = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { token, withServiceWorker } = contextValue;
  return withServiceWorker ? undefined : token;
};

export const useTokenHasExpired = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { tokenHasExpired } = contextValue;
  return tokenHasExpired;
};

export const useHandleLoginResult = () => {
  const { handleLoginResult } = useContext(context);
  if (!handleLoginResult) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  return handleLoginResult;
};

export const useHandleLogoutResult = () => {
  const { handleLogoutResult } = useContext(context);
  if (!handleLogoutResult) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  return handleLogoutResult;
};

export const useHandleExpiredToken = () => {
  const { handleExpiredToken } = useContext(context);
  if (!handleExpiredToken) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  return handleExpiredToken;
};

export const useHandleChangedClientId = () => {
  const { handleChangedClientId } = useContext(context);
  if (!handleChangedClientId) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  return handleChangedClientId;
};

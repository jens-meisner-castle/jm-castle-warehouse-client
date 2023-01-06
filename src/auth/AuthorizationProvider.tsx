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
import { useVerifyToken } from "../hooks/useVerifyToken";

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
  handleLoginResult: (loginResult: LoginResult) => void;
  handleLogoutResult: () => void;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

const initialValue: Authorization = {
  tokenHasExpired: false,
  withServiceWorker: false,
  token: undefined,
  handleLoginResult: (loginResult: LoginResult) => {
    console.error("Empty handleLoginResult function. Result is", loginResult);
  },
  handleLogoutResult: () => {
    console.error("Empty handleLogoutResult function.");
  },
  handleExpiredToken(errorCode) {
    console.error("Empty handleExpiredToken function.", errorCode);
  },
};

const context = createContext(initialValue);

export const { Provider } = context;

export type AuthorizationProviderProps = {
  withServiceWorker: boolean;
} & PropsWithChildren;

export const AuthorizationProvider = (props: AuthorizationProviderProps) => {
  const { children, withServiceWorker } = props;
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const handleExpiredToken = useCallback((errorCode: ErrorCode | undefined) => {
    if (
      errorCode === TokenExpiredErrorCode ||
      errorCode === JsonWebTokenError ||
      errorCode === TokenUndefinedErrorCode
    ) {
      setIsTokenExpired(true);
    }
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
    handleLoginResult,
    handleLogoutResult,
    handleExpiredToken,
  });

  // check once if the service worker has already a valid token
  const verifyResult = useVerifyToken(backendApiUrl, withServiceWorker ? 1 : 0);

  useEffect(() => {
    // check once if the service worker has already (or still) a valid token
    const { response } = verifyResult;
    const { username, roles, expiresAtDisplay, expiresAtMs } = response || {};
    if (username && roles && expiresAtDisplay && expiresAtMs) {
      setProviderValue((previous) => ({
        ...previous,
        verifiedUser: { username, roles, expiresAtDisplay, expiresAtMs },
      }));
    }
  }, [verifyResult]);

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
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { handleLoginResult } = contextValue;
  return handleLoginResult;
};

export const useHandleLogoutResult = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { handleLogoutResult } = contextValue;
  return handleLogoutResult;
};

export const useHandleExpiredToken = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { handleExpiredToken } = contextValue;
  return handleExpiredToken;
};

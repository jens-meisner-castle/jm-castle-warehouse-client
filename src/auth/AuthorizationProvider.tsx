import { LoginResult } from "jm-castle-warehouse-types/build";
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
    roles: string[];
    expiresAtMs: number;
    expiresAtDisplay: string;
  };
  tokenHasExpired: boolean;
  handleLoginResult: (loginResult: LoginResult) => void;
  handleLogoutResult: () => void;
  setTokenHasExpired: () => void;
}

const initialValue: Authorization = {
  tokenHasExpired: false,
  handleLoginResult: (loginResult: LoginResult) => {
    console.error("Empty handleLoginResult function. Result is", loginResult);
  },
  handleLogoutResult: () => {
    console.error("Empty handleLogoutResult function.");
  },
  setTokenHasExpired: () => {
    console.error("Empty setTokenHasExpired function.");
  },
};

const context = createContext(initialValue);

export const { Provider } = context;

export const AuthorizationProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const setTokenHasExpired = useCallback(() => {
    // console.log("token expired");
    setIsTokenExpired(true);
  }, []);

  const handleLoginResult = useCallback((loginResult: LoginResult) => {
    const { token, username, roles, expiresAtDisplay, expiresAtMs } =
      loginResult || {};
    if (navigator.serviceWorker?.controller) {
      if (token) {
        navigator.serviceWorker.controller.postMessage({
          type: "SET_TOKEN",
          token: `Bearer ${token}`,
        });
      }
    }
    if (username && roles && expiresAtDisplay && expiresAtMs) {
      const verifiedUser = { username, roles, expiresAtDisplay, expiresAtMs };
      setProviderValue((previous) => ({
        ...previous,
        verifiedUser,
        tokenHasExpired: false,
      }));
    } else {
      setProviderValue((previous) => ({
        ...previous,
        verifiedUser: undefined,
        tokenHasExpired: false,
      }));
    }
  }, []);

  const handleLogoutResult = useCallback(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "RESET_TOKEN",
      });
    }
    setProviderValue((previous) => ({
      ...previous,
      verifiedUser: undefined,
      tokenHasExpired: false,
    }));
  }, []);

  const [providerValue, setProviderValue] = useState<Authorization>({
    tokenHasExpired: isTokenExpired,
    handleLoginResult,
    handleLogoutResult,
    setTokenHasExpired,
  });

  // check once if the service worker has already a valid token
  const verifyResult = useVerifyToken(backendApiUrl, 1);

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
    if (isTokenExpired && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "RESET_TOKEN",
      });
    }
    setProviderValue((previous) => ({
      ...previous,
      tokenHasExpired: isTokenExpired,
    }));
  }, [isTokenExpired]);

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

export const useSetTokenHasExpired = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { setTokenHasExpired } = contextValue;
  return setTokenHasExpired;
};

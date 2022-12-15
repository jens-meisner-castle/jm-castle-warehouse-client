import { LoginResult } from "jm-castle-warehouse-types/build";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Authorization {
  loginResult?: LoginResult;
  tokenHasExpired: boolean;
  setLoginResult: (loginResult: LoginResult) => void;
  resetLoginResult: () => void;
  setTokenHasExpired: () => void;
}

const initialValue: Authorization = {
  tokenHasExpired: false,
  setLoginResult: (loginResult: LoginResult) => {
    console.error("Empty setLoginResult function. Result is", loginResult);
  },
  resetLoginResult: () => {
    console.error("Empty resetLoginResult function.");
  },
  setTokenHasExpired: () => {
    console.error("Empty setTokenHasExpired function.");
  },
};

const context = createContext(initialValue);

export const { Provider } = context;

export interface AuthorizationProviderProps {
  loginResult?: string;
}

export const AuthorizationProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [loginResult, setLoginResult] = useState<LoginResult | undefined>(
    undefined
  );
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const setTokenHasExpired = useCallback(() => {
    // console.log("token expired");
    setIsTokenExpired(true);
  }, []);
  const resetLoginResult = useCallback(() => setLoginResult(undefined), []);

  const [providerValue, setProviderValue] = useState<Authorization>({
    tokenHasExpired: isTokenExpired,
    loginResult,
    setLoginResult,
    resetLoginResult,
    setTokenHasExpired,
  });
  useEffect(() => {
    // console.log("loginResultChanged", loginResult);
    setProviderValue((previous) => ({
      ...previous,
      loginResult,
      tokenHasExpired: false,
    }));
  }, [loginResult]);
  useEffect(() => {
    // console.log("isTokenExpiredChanged", isTokenExpired);
    setProviderValue((previous) => ({
      ...previous,
      tokenHasExpired: isTokenExpired,
    }));
  }, [isTokenExpired]);

  return <Provider value={providerValue}>{children}</Provider>;
};

export const useAuthorizationToken = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { loginResult } = contextValue;
  return loginResult && loginResult.token;
};

export const useLoginResult = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { loginResult } = contextValue;
  return loginResult;
};

export const useTokenHasExpired = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { tokenHasExpired } = contextValue;
  return tokenHasExpired;
};

export const useSetLoginResult = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { setLoginResult } = contextValue;
  return setLoginResult;
};

export const useResetLoginResult = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { resetLoginResult } = contextValue;
  return resetLoginResult;
};

export const useSetTokenHasExpired = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("AuthorizationProvider is needed in react hierarchy.");
  }
  const { setTokenHasExpired } = contextValue;
  return setTokenHasExpired;
};

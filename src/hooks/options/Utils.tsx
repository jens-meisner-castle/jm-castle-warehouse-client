import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../../auth/AuthorizationProvider";

export const defaultFetchOptions = (token?: string): RequestInit => {
  return {
    method: "GET",
    cache: "no-cache",
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  };
};

export const useDefaultFetchOptions = (): RequestInit => {
  const token = useAuthorizationToken();
  const [options, setOptions] = useState({
    method: "GET",
    cache: "no-cache" as RequestCache,
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  useEffect(() => {
    setOptions((previous) => {
      if (token) {
        return previous.headers?.authorization === `Bearer ${token}`
          ? previous
          : {
              ...previous,
              headers: { authorization: `Bearer ${token}` },
            };
      } else {
        return previous.headers?.authorization
          ? { ...previous, headers: undefined }
          : previous;
      }
    });
  }, [token]);
  return options;
};

export const defaultPageSize = 20;

import { useEffect, useState } from "react";

export const defaultFetchOptions = (): RequestInit => {
  return {
    method: "GET",
    cache: "no-cache",
    credentials: "omit",
    referrerPolicy: "origin-when-cross-origin",
  };
};

export const useDefaultFetchOptions = (): RequestInit => {
  const token = "stored in service worker"; // useAuthorizationToken();
  const [options, setOptions] = useState({
    method: "GET",
    cache: "no-cache" as RequestCache,
    headers: { authorization: `Bearer ${token}` },
  });
  useEffect(
    () =>
      setOptions((previous) => {
        return previous.headers?.authorization === `Bearer ${token}`
          ? previous
          : {
              ...previous,
              headers: { authorization: `Bearer ${token}` },
            };
      }),
    [token]
  );
  return options;
};

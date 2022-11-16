export const defaultFetchOptions = (): RequestInit => {
  return {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "omit",
    referrerPolicy: "origin-when-cross-origin",
  };
};

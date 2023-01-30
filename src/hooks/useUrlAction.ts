import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const getNewState = (search: string) => {
  const searchParams = new URLSearchParams(search);
  const action = searchParams.get("action");
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => (params[key] = value));
  return { action, params };
};

export const useUrlAction = () => {
  const { search } = useLocation();
  const [state, setState] = useState<{
    action: string | null;
    params: Record<string, string>;
  } | null>(() => getNewState(search));
  useEffect(() => {
    setState(getNewState(search));
  }, [search]);
  return state;
};

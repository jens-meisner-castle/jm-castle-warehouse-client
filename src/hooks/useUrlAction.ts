import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useUrlAction = () => {
  const { search } = useLocation();
  const [state, setState] = useState<{
    action: string | null;
    params: Record<string, string>;
  } | null>(null);
  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const action = searchParams.get("action");
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => (params[key] = value));
    setState({ action, params });
  }, [search]);
  return state;
};

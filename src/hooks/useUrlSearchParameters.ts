import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const getNewState = (search: string) => {
  const searchParams = new URLSearchParams(search);
  const params: Record<string, string[]> = {};

  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key);
    values.length && (params[key] = values);
  }
  return { params };
};

export const useUrlSearchParameters = () => {
  const { search } = useLocation();

  const [state, setState] = useState<{
    params: Record<string, string[]>;
  }>(() => getNewState(search));

  useEffect(() => {
    setState(getNewState(search));
  }, [search]);

  return state;
};

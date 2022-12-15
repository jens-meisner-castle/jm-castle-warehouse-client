import { useEffect, useState } from "react";
import { useLoginResult } from "../auth/AuthorizationProvider";

export interface Page {
  to: string;
  label: string;
}
export const allPages = {
  home: { to: "/", label: "Home", index: 0 },
  dashboard: { to: "/dashboard", label: "Dashboard", index: 1 },
  history: { to: "/history", label: "History", index: 2 },
  masterdata: { to: "/masterdata", label: "Masterdata", index: 3 },
  databaseTest: { to: "/database-test", label: "DB-Test", index: 4 },
  systemStatus: { to: "/system", label: "System", index: 5 },
  systemSetup: { to: "/system-setup", label: "Setup", index: 6 },
  help: { to: "/help", label: "Help", index: 7 },
  login: { to: "/login", label: "Login", index: 8 },
};

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([allPages.home, allPages.login]);
  const loginResult = useLoginResult();
  useEffect(() => {
    if (loginResult && loginResult.roles) {
      setPages(Object.values(allPages).sort((a, b) => a.index - b.index));
    } else {
      setPages([allPages.home, allPages.login]);
    }
  }, [loginResult]);
  return pages;
};

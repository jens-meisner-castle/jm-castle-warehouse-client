import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useLoginResult } from "../auth/AuthorizationProvider";
import { Page as DashboardPage } from "../pages/dashboard/Page";
import { Page as DbTestPage } from "../pages/database-test/Page";
import { Page as HelpPage } from "../pages/help/Page";
import { Page as HistoryPage } from "../pages/history/Page";
import { Page as LoginPage } from "../pages/login/Page";
import { Page as ArticlePage } from "../pages/masterdata/article/Page";
import { Page as MasterdataPage } from "../pages/masterdata/main/Page";
import { Page as StoreSectionPage } from "../pages/masterdata/store-section/Page";
import { Page as StorePage } from "../pages/masterdata/store/Page";
import { Page as StartPage } from "../pages/start/Page";
import { Page as SystemSetupPage } from "../pages/system-setup/Page";
import { Page as SystemStatusPage } from "../pages/system-status/Page";
import { allPages } from "./Pages";

export interface AppRoute {
  path: string;
  element: () => JSX.Element;
}

const allRoutes: Record<string, AppRoute> = {
  home: { path: allPages.home.to, element: StartPage },
  dashboard: { path: allPages.dashboard.to, element: DashboardPage },
  history: { path: allPages.history.to, element: HistoryPage },
  masterdata: { path: allPages.masterdata.to, element: MasterdataPage },
  databaseTest: { path: allPages.databaseTest.to, element: DbTestPage },
  systemStatus: {
    path: allPages.systemStatus.to,
    element: SystemStatusPage,
  },
  systemSetup: { path: allPages.systemSetup.to, element: SystemSetupPage },
  help: { path: allPages.help.to, element: HelpPage },
  login: { path: allPages.login.to, element: LoginPage },
  masterdataArticle: { path: "/masterdata/article", element: ArticlePage },
  masterdataStore: { path: "/masterdata/store", element: StorePage },
  masterdataStoreSection: {
    path: "/masterdata/store-section",
    element: StoreSectionPage,
  },
};

export const AppRoutes = () => {
  const routes = useAppRoutes();
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={<route.element />} />
      ))}
    </Routes>
  );
};

export const useAppRoutes = () => {
  const [routes, setRoutes] = useState<AppRoute[]>([
    allRoutes.home,
    allRoutes.login,
    { path: "*", element: StartPage },
  ]);
  const loginResult = useLoginResult();
  useEffect(() => {
    if (loginResult && loginResult.roles) {
      setRoutes([
        ...Object.values(allRoutes),
        { path: "*", element: StartPage },
      ]);
    } else {
      setRoutes([
        allRoutes.home,
        allRoutes.login,
        { path: "*", element: StartPage },
      ]);
    }
  }, [loginResult]);
  return routes;
};

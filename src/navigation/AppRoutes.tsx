import { UserRole } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useUserRoles } from "../auth/AuthorizationProvider";
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
  neededRole: UserRole | "none";
  element: () => JSX.Element;
}

const allRoutes: Record<string, AppRoute> = {
  home: { path: allPages.home.to, element: StartPage, neededRole: "none" },
  dashboard: {
    path: allPages.dashboard.to,
    element: DashboardPage,
    neededRole: "internal",
  },
  history: {
    path: allPages.history.to,
    element: HistoryPage,
    neededRole: "internal",
  },
  masterdata: {
    path: allPages.masterdata.to,
    element: MasterdataPage,
    neededRole: "internal",
  },
  databaseTest: {
    path: allPages.databaseTest.to,
    element: DbTestPage,
    neededRole: "admin",
  },
  systemStatus: {
    path: allPages.systemStatus.to,
    element: SystemStatusPage,
    neededRole: "admin",
  },
  systemSetup: {
    path: allPages.systemSetup.to,
    element: SystemSetupPage,
    neededRole: "admin",
  },
  help: { path: allPages.help.to, element: HelpPage, neededRole: "external" },
  login: { path: allPages.login.to, element: LoginPage, neededRole: "none" },
  masterdataArticle: {
    path: "/masterdata/article",
    element: ArticlePage,
    neededRole: "internal",
  },
  masterdataStore: {
    path: "/masterdata/store",
    element: StorePage,
    neededRole: "internal",
  },
  masterdataStoreSection: {
    neededRole: "internal",
    path: "/masterdata/store-section",
    element: StoreSectionPage,
  },
};

const FallbackRoute: AppRoute = {
  path: "*",
  element: StartPage,
  neededRole: "none",
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
    FallbackRoute,
  ]);

  const roles = useUserRoles();

  useEffect(() => {
    if (roles) {
      setRoutes([
        ...Object.values(allRoutes).filter(
          (route) =>
            route.neededRole === "none" || roles.includes(route.neededRole)
        ),
        FallbackRoute,
      ]);
    } else {
      setRoutes([allRoutes.home, allRoutes.login, FallbackRoute]);
    }
  }, [roles]);
  return routes;
};

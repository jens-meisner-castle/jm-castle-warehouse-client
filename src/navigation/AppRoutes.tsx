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
import { Page as HashtagPage } from "../pages/masterdata/hashtag/Page";
import { Page as ImageContentPage } from "../pages/masterdata/image/Page";
import { Page as MasterdataPage } from "../pages/masterdata/main/Page";
import { Page as ReceiverPage } from "../pages/masterdata/receiver/Page";
import { Page as StoreSectionPage } from "../pages/masterdata/store-section/Page";
import { Page as StorePage } from "../pages/masterdata/store/Page";
import { Page as StartPage } from "../pages/start/Page";
import { Page as StockArticlePage } from "../pages/stock/article/Page";
import { Page as EmissionPage } from "../pages/stock/emission/Page";
import { Page as StockPage } from "../pages/stock/main/Page";
import { Page as ReceiptPage } from "../pages/stock/receipt/Page";
import { Page as SystemSetupPage } from "../pages/system-setup/Page";
import { Page as SystemStatusPage } from "../pages/system-status/Page";
import { allPages } from "./Pages";

export interface AppRoute {
  path: string;
  neededRole: UserRole | "none";
  element: () => JSX.Element;
}

const home: AppRoute = {
  path: allPages.home.to,
  element: StartPage,
  neededRole: "none",
};
const dashboard: AppRoute = {
  path: allPages.dashboard.to,
  element: DashboardPage,
  neededRole: "internal",
};
const history: AppRoute = {
  path: allPages.history.to,
  element: HistoryPage,
  neededRole: "internal",
};
const stock: AppRoute = {
  path: allPages.stock.to,
  element: StockPage,
  neededRole: "internal",
};
const masterdata: AppRoute = {
  path: allPages.masterdata.to,
  element: MasterdataPage,
  neededRole: "internal",
};
const databaseTest: AppRoute = {
  path: allPages.databaseTest.to,
  element: DbTestPage,
  neededRole: "admin",
};
const systemStatus: AppRoute = {
  path: allPages.systemStatus.to,
  element: SystemStatusPage,
  neededRole: "admin",
};
const systemSetup: AppRoute = {
  path: allPages.systemSetup.to,
  element: SystemSetupPage,
  neededRole: "admin",
};
const help: AppRoute = {
  path: allPages.help.to,
  element: HelpPage,
  neededRole: "external",
};
const login: AppRoute = {
  path: allPages.login.to,
  element: LoginPage,
  neededRole: "none",
};
const stockReceipt: AppRoute = {
  path: "/stock/receipt",
  element: ReceiptPage,
  neededRole: "internal",
};
const stockEmission: AppRoute = {
  path: "/stock/emission",
  element: EmissionPage,
  neededRole: "internal",
};
const stockArticle: AppRoute = {
  path: "/stock/article",
  element: StockArticlePage,
  neededRole: "external",
};
const masterdataArticle: AppRoute = {
  path: "/masterdata/article",
  element: ArticlePage,
  neededRole: "internal",
};
const masterdataStore: AppRoute = {
  path: "/masterdata/store",
  element: StorePage,
  neededRole: "internal",
};
const masterdataStoreSection: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/store-section",
  element: StoreSectionPage,
};
const masterdataImageContent: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/image",
  element: ImageContentPage,
};
const masterdataHashtag: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/hashtag",
  element: HashtagPage,
};
const masterdataReceiver: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/receiver",
  element: ReceiverPage,
};

const AllRoutes = {
  home,
  login,
  help,
  systemSetup,
  systemStatus,
  databaseTest,
  dashboard,
  history,
  stock,
  masterdata,
  masterdataArticle,
  masterdataHashtag,
  masterdataImageContent,
  masterdataReceiver,
  masterdataStore,
  masterdataStoreSection,
  stockArticle,
  stockEmission,
  stockReceipt,
};

export const allRoutes = () => AllRoutes;

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
    AllRoutes.home,
    AllRoutes.login,
    FallbackRoute,
  ]);

  const roles = useUserRoles();

  useEffect(() => {
    if (roles) {
      setRoutes([
        ...Object.values(AllRoutes).filter(
          (route) =>
            route.neededRole === "none" || roles.includes(route.neededRole)
        ),
        FallbackRoute,
      ]);
    } else {
      setRoutes([AllRoutes.home, AllRoutes.login, FallbackRoute]);
    }
  }, [roles]);
  return routes;
};

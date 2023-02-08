import { UserRole } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useUserRoles } from "../auth/AuthorizationProvider";
import { Page as DashboardPage } from "../pages/dashboard/Page";
import { Page as DbTestPage } from "../pages/database-test/Page";
import { Page as FallbackPage } from "../pages/fallback/Page";
import { Page as HelpPage } from "../pages/help/Page";
import { Page as HistoryPage } from "../pages/history/Page";
import { Page as LoginPage } from "../pages/login/Page";
import { Page as ArticlePage } from "../pages/masterdata/article/Page";
import { Page as AttributePage } from "../pages/masterdata/attribute/Page";
import { Page as CostunitPage } from "../pages/masterdata/costunit/Page";
import { Page as HashtagPage } from "../pages/masterdata/hashtag/Page";
import { Page as ImageContentPage } from "../pages/masterdata/image/Page";
import { Page as MasterdataPage } from "../pages/masterdata/main/Page";
import { Page as ManufacturerPage } from "../pages/masterdata/manufacturer/Page";
import { Page as ReceiverPage } from "../pages/masterdata/receiver/Page";
import { Page as StoreSectionPage } from "../pages/masterdata/store-section/Page";
import { Page as StorePage } from "../pages/masterdata/store/Page";
import { Page as StartPage } from "../pages/start/Page";
import { Page as StockArticlePage } from "../pages/stock/article/Page";
import { Page as EmissionPage } from "../pages/stock/emission/Page";
import { Page as StockPage } from "../pages/stock/main/Page";
import { Page as ReceiptPage } from "../pages/stock/receipt/Page";
import { Page as StockSectionDetailPage } from "../pages/stock/section-detail/Page";
import { Page as SystemExportPage } from "../pages/system-export/Page";
import { Page as SystemImportPage } from "../pages/system-import/Page";
import { Page as SystemSetupPage } from "../pages/system-setup/Page";
import { Page as SystemStatusPage } from "../pages/system-status/Page";
import { Page as UsecasePage } from "../pages/usecase/Page";
import { allMainPages } from "./Pages";

export interface AppRoute {
  path: string;
  neededRole: UserRole | "none";
  element: () => JSX.Element;
}

const home: AppRoute = {
  path: allMainPages.home.to,
  element: StartPage,
  neededRole: "none",
};
const dashboard: AppRoute = {
  path: allMainPages.dashboard.to,
  element: DashboardPage,
  neededRole: "internal",
};
const usecase: AppRoute = {
  path: allMainPages.usecase.to,
  element: UsecasePage,
  neededRole: "internal",
};
const history: AppRoute = {
  path: allMainPages.history.to,
  element: HistoryPage,
  neededRole: "internal",
};
const stock: AppRoute = {
  path: allMainPages.stock.to,
  element: StockPage,
  neededRole: "internal",
};
const masterdata: AppRoute = {
  path: allMainPages.masterdata.to,
  element: MasterdataPage,
  neededRole: "internal",
};
const databaseTest: AppRoute = {
  path: allMainPages.databaseTest.to,
  element: DbTestPage,
  neededRole: "admin",
};
const systemStatus: AppRoute = {
  path: allMainPages.systemStatus.to,
  element: SystemStatusPage,
  neededRole: "admin",
};
const systemSetup: AppRoute = {
  path: allMainPages.systemSetup.to,
  element: SystemSetupPage,
  neededRole: "admin",
};
const help: AppRoute = {
  path: allMainPages.help.to,
  element: HelpPage,
  neededRole: "external",
};
const login: AppRoute = {
  path: allMainPages.login.to,
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
const stockSectionDetail: AppRoute = {
  path: "/stock/section-detail",
  element: StockSectionDetailPage,
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
const masterdataAttribute: AppRoute = {
  path: "/masterdata/attribute",
  element: AttributePage,
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
const masterdataCostunit: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/costunit",
  element: CostunitPage,
};
const masterdataReceiver: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/receiver",
  element: ReceiverPage,
};
const masterdataManufacturer: AppRoute = {
  neededRole: "internal",
  path: "/masterdata/manufacturer",
  element: ManufacturerPage,
};
const systemExport: AppRoute = {
  neededRole: "admin",
  path: "/system-export",
  element: SystemExportPage,
};
const systemImport: AppRoute = {
  neededRole: "admin",
  path: "/system-import",
  element: SystemImportPage,
};
const fallback: AppRoute = {
  neededRole: "none",
  path: "/fallback",
  element: FallbackPage,
};

const AllRoutes = {
  home,
  login,
  fallback,
  help,
  systemSetup,
  systemStatus,
  databaseTest,
  dashboard,
  history,
  stock,
  masterdata,
  masterdataArticle,
  masterdataCostunit,
  masterdataHashtag,
  masterdataImageContent,
  masterdataReceiver,
  masterdataManufacturer,
  masterdataAttribute,
  masterdataStore,
  masterdataStoreSection,
  stockArticle,
  stockSectionDetail,
  stockEmission,
  stockReceipt,
  usecase,
  systemExport,
  systemImport,
};

export const allRoutes = () => AllRoutes;

const FallbackRoute: AppRoute = {
  path: "*",
  element: FallbackPage,
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

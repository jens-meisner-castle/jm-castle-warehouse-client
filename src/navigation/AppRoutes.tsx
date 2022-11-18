import { Route, Routes } from "react-router-dom";
import { Page as DashboardPage } from "../pages/dashboard/Page";
import { Page as DbTestPage } from "../pages/database-test/Page";
import { Page as HelpPage } from "../pages/help/Page";
import { Page as HistoryPage } from "../pages/history/Page";
import { Page as ArticlePage } from "../pages/masterdata/article/Page";
import { Page as MasterdataPage } from "../pages/masterdata/main/Page";
import { Page as StoreSectionPage } from "../pages/masterdata/store-section/Page";
import { Page as StorePage } from "../pages/masterdata/store/Page";
import { Page as StartPage } from "../pages/start/Page";
import { Page as SystemSetupPage } from "../pages/system-setup/Page";
import { Page as SystemStatusPage } from "../pages/system-status/Page";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/masterdata" element={<MasterdataPage />} />
      <Route path="/masterdata/main" element={<MasterdataPage />} />
      <Route path="/masterdata/article" element={<ArticlePage />} />
      <Route path="/masterdata/store" element={<StorePage />} />
      <Route path="/masterdata/store-section" element={<StoreSectionPage />} />
      <Route path="/system-setup" element={<SystemSetupPage />} />
      <Route path="/system" element={<SystemStatusPage />} />
      <Route path="/database-test" element={<DbTestPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/" element={<StartPage />} />
    </Routes>
  );
};

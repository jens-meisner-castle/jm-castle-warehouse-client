import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthorizationProvider } from "./auth/AuthorizationProvider";
import { ExportImportActiveDialog } from "./components/dialog/ExportImportActiveDialog";
import { backendPubSubApiUrl } from "./configuration/Urls";
import { usePubSubExportImportActive } from "./hooks/usePubSubExportImportActive";
import { usePubSubTableRowsChanges } from "./hooks/usePubSubTableRowsChanges";
import { useServiceWorkerExists } from "./hooks/useServiceWorkerExists";
import { AppRoutes } from "./navigation/AppRoutes";
import { NavigationBar } from "./navigation/NavigationBar";
import { registerServiceWorker } from "./registerServiceWorker";
import { muiThemeDark } from "./theme/MuiTheme";

const Frame = () => {
  const [exportImportActive, setExportImportActive] = useState({
    exportActive: false,
    importActive: false,
  });
  useEffect(() => registerServiceWorker(), []);
  const { response, error: serviceWorkerError } = useServiceWorkerExists(1);
  const { exists: withServiceWorker } = response || {};
  serviceWorkerError &&
    console.log("service worker not active", serviceWorkerError);
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: { queries: { staleTime: 1000 * 60 * 60 * 24 } },
    })
  );

  const { state: tableRowsState, clearChanges } =
    usePubSubTableRowsChanges(backendPubSubApiUrl);

  useEffect(() => {
    const { changes } = tableRowsState || {};
    if (changes?.length) {
      changes.forEach((change) => {
        queryClient.invalidateQueries({ queryKey: [change.table] });
      });
      clearChanges(changes.map((c) => c.table));
    }
  }, [tableRowsState, clearChanges, queryClient]);

  const { state: newExportImportState, error: exportImportError } =
    usePubSubExportImportActive(backendPubSubApiUrl);
  exportImportError &&
    console.error(
      "received error from export-import-active",
      exportImportError
    );

  useEffect(() => {
    newExportImportState && setExportImportActive(newExportImportState);
  }, [newExportImportState]);

  const heading = useMemo(
    () =>
      exportImportActive.exportActive
        ? "An export is currently running"
        : exportImportActive.importActive
        ? "An import is currently running"
        : "",
    [exportImportActive]
  );
  const description = useMemo(
    () =>
      exportImportActive.exportActive
        ? "Please wait until the export is finished"
        : exportImportActive.importActive
        ? "Please wait until the import is finished"
        : "",
    [exportImportActive]
  );

  return (
    <div className="App">
      <ThemeProvider theme={muiThemeDark}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <AuthorizationProvider withServiceWorker={!!withServiceWorker}>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                {(exportImportActive.exportActive ||
                  exportImportActive.importActive) && (
                  <ExportImportActiveDialog
                    handleClose={() =>
                      console.log(
                        "please wait until export or import is finished"
                      )
                    }
                    heading={heading}
                    description={description}
                  />
                )}
                <NavigationBar />
                <AppRoutes />
              </BrowserRouter>
            </QueryClientProvider>
          </AuthorizationProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </div>
  );
};

export default Frame;

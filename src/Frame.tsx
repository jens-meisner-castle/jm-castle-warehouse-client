import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthorizationProvider } from "./auth/AuthorizationProvider";
import { backendPubSubApiUrl } from "./configuration/Urls";
import { usePubSubTableRowsChanges } from "./hooks/usePubSubTableRowsChanges";
import { useServiceWorkerExists } from "./hooks/useServiceWorkerExists";
import { AppRoutes } from "./navigation/AppRoutes";
import { NavigationBar } from "./navigation/NavigationBar";
import { registerServiceWorker } from "./registerServiceWorker";
import { muiThemeDark } from "./theme/MuiTheme";

const Frame = () => {
  useEffect(() => registerServiceWorker(), []);
  const { response, error } = useServiceWorkerExists(1);
  const { exists: withServiceWorker } = response || {};
  error && console.log("service worker not active", error);
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: { queries: { staleTime: 1000 * 60 * 60 * 24 } },
    })
  );

  const { state, clearChanges } =
    usePubSubTableRowsChanges(backendPubSubApiUrl);

  useEffect(() => {
    const { changes } = state || {};
    if (changes?.length) {
      changes.forEach((change) =>
        queryClient.invalidateQueries({ queryKey: [change.table] })
      );
      clearChanges(changes.map((c) => c.table));
    }
  }, [state, clearChanges, queryClient]);

  return (
    <div className="App">
      <ThemeProvider theme={muiThemeDark}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <AuthorizationProvider withServiceWorker={!!withServiceWorker}>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
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

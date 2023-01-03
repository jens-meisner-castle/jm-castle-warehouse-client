import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { BrowserRouter } from "react-router-dom";
import { AuthorizationProvider } from "./auth/AuthorizationProvider";
import { useServiceWorkerExists } from "./hooks/useServiceWorkerExists";
import { AppRoutes } from "./navigation/AppRoutes";
import { NavigationBar } from "./navigation/NavigationBar";
import { registerServiceWorker } from "./registerServiceWorker";
import { muiThemeDark } from "./theme/MuiTheme";

const Frame = () => {
  registerServiceWorker();
  const { response, error } = useServiceWorkerExists(1);
  const { exists: withServiceWorker } = response || {};
  error && console.log("service worker not active", error);

  return (
    <div className="App">
      <ThemeProvider theme={muiThemeDark}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <AuthorizationProvider withServiceWorker={!!withServiceWorker}>
            <BrowserRouter>
              <NavigationBar />
              <AppRoutes />
            </BrowserRouter>
          </AuthorizationProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </div>
  );
};

export default Frame;

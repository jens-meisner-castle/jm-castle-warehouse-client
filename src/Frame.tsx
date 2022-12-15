import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { BrowserRouter } from "react-router-dom";
import { AuthorizationProvider } from "./auth/AuthorizationProvider";
import { AppRoutes } from "./navigation/AppRoutes";
import { NavigationBar } from "./navigation/NavigationBar";
import { muiThemeDark } from "./theme/MuiTheme";

const Frame = () => {
  return (
    <div className="App">
      <ThemeProvider theme={muiThemeDark}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <AuthorizationProvider>
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

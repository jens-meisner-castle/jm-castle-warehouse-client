import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./navigation/AppRoutes";
import { NavigationBar } from "./navigation/NavigationBar";
import { muiThemeDark } from "./theme/MuiTheme";

const Frame = () => {
  return (
    <div className="App">
      <ThemeProvider theme={muiThemeDark}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <BrowserRouter>
            <NavigationBar />
            <AppRoutes />
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </div>
  );
};

export default Frame;

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const muiThemeLight = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "light",
      primary: { main: "#f9a825" },
      secondary: { main: "#1b5e20" },
    },
  })
);

export const muiThemeDark = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#f9a825" },
      secondary: { main: "#1b5e20" },
    },
  })
);

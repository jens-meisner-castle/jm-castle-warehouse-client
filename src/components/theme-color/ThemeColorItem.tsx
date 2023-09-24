import { Box, styled } from "@mui/material";

export const ThemeColorItem = styled(Box)(({ theme }) => ({
  flex: "1 auto",
  color: "black",
  borderRadius: 30,
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  marginRight: theme.spacing(1),
  display: "flex",
  justifyContent: "space-around",
}));

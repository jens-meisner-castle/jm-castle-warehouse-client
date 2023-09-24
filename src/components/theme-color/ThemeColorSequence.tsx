import { Box, styled } from "@mui/material";

export const ThemeColorSequence = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-around",
  padding: theme.spacing(1),
  paddingTop: 0,
  paddingRight: 0,
}));

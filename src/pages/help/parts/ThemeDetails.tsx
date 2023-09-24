import { MoreHoriz } from "@mui/icons-material";
import {
  Box,
  Collapse,
  Fade,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { ThemeColorItem } from "../../../components/theme-color/ThemeColorItem";
import { ThemeColorSequence } from "../../../components/theme-color/ThemeColorSequence";

export const ThemeDetails = () => {
  const colors = [
    "primary.main",
    "secondary.main",
    "error.main",
    "warning.main",
    "info.main",
    "success.main",
    "text.primary",
    "text.secondary",
    "text.disabled",
  ];
  const transitionTimeout = 1000;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [transition, setTransition] = useState(false);

  const open = () => {
    setIsDetailsOpen(true);
    setTransition(true);
  };

  const close = () => {
    setTransition(false);
    setTimeout(() => setIsDetailsOpen(false), transitionTimeout);
  };

  return (
    <>
      <Paper>
        <Typography component="span" variant="h6">
          {"Theme details"}
        </Typography>
        <IconButton onClick={() => (isDetailsOpen ? close() : open())}>
          <MoreHoriz />
        </IconButton>
      </Paper>
      {isDetailsOpen && (
        <Paper style={{ marginTop: 5 }}>
          <ThemeColorSequence>
            {colors.map((color) => {
              return (
                <Fade in={transition} timeout={transitionTimeout}>
                  <ThemeColorItem
                    key={color}
                    sx={{
                      bgcolor: color,
                    }}
                  >
                    {color}
                  </ThemeColorItem>
                </Fade>
              );
            })}
          </ThemeColorSequence>
        </Paper>
      )}
    </>
  );
};

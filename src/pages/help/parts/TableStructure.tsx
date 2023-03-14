import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { useState } from "react";

export const TableStructure = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <Typography component="span" variant="h6">
            {"Tabellenstruktur"}
          </Typography>
          <IconButton onClick={() => setIsDetailsOpen((previous) => !previous)}>
            <MoreHorizIcon />
          </IconButton>
        </Paper>
      </Grid>
      {isDetailsOpen && (
        <Grid item>
          <img
            style={{ maxWidth: "100%" }}
            src={"image/table-structure-castle-warehouse.png"}
          />
        </Grid>
      )}
    </Grid>
  );
};

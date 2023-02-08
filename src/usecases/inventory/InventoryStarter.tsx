import { Button, Grid, Typography } from "@mui/material";
import { useStartUsecase } from "../context/UsecaseContext";
import { InventoryState } from "../Types";

const usecaseState: InventoryState = {
  id: "inventory",
  data: {},
};

export const InventoryStarter = () => {
  const startUsecase = useStartUsecase();

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{"Inventur"}</Typography>
      </Grid>
      <Grid item>
        <Button onClick={() => startUsecase(usecaseState)} variant="contained">
          {"Starten"}
        </Button>
      </Grid>
    </Grid>
  );
};

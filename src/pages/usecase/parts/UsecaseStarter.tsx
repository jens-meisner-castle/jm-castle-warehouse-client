import { Grid, Paper, Typography } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useUsecaseState } from "../../../usecases/context/UsecaseContext";
import { InventoryStarter } from "../../../usecases/inventory/InventoryStarter";
import { RelocateStarter } from "../../../usecases/relocate/RelocateStarter";

export interface UsecaseStarterProps {
  usecase?: string;
  params?: Record<string, string[]>;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const UsecaseStarter = (props: UsecaseStarterProps) => {
  const { usecase, params, handleExpiredToken } = props;
  const usecaseState = useUsecaseState();
  const { id } = usecaseState || {};

  return id !== "empty" ? (
    <></>
  ) : (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Anwendungsfälle"}</Typography>
        <Grid container direction="row">
          <Grid item>
            <Paper style={{ padding: 5, margin: 5, marginLeft: 0 }}>
              <InventoryStarter />
            </Paper>
          </Grid>
          <Grid item>
            <Paper style={{ padding: 5, margin: 5, marginLeft: 0 }}>
              <RelocateStarter
                params={usecase === "relocate" ? params : undefined}
                handleExpiredToken={handleExpiredToken}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

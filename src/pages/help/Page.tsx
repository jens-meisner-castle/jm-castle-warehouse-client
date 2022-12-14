import { Grid, Typography } from "@mui/material";
import { useUserRoles } from "../../auth/AuthorizationProvider";
import { ApiServices } from "./parts/ApiServices";
import { HowToCreateCertificates } from "./parts/HowToCreateCertificates";

export const Page = () => {
  const roles = useUserRoles();

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Help"}</Typography>
      </Grid>
      {roles?.includes("admin") && (
        <Grid item>
          <ApiServices />
        </Grid>
      )}
      {roles?.includes("admin") && (
        <Grid item>
          <div style={{ marginTop: 5 }}>
            <HowToCreateCertificates />
          </div>
        </Grid>
      )}
    </Grid>
  );
};

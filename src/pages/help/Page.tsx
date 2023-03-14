import { Grid, Typography } from "@mui/material";
import { useUserRoles } from "../../auth/AuthorizationProvider";
import { ApiServices } from "./parts/ApiServices";
import { HowToCreateCertificates } from "./parts/HowToCreateCertificates";
import { TableStructure } from "./parts/TableStructure";
import { VersionUpdates } from "./parts/VersionUpdates";

export const Page = () => {
  const roles = useUserRoles();

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Help"}</Typography>
      </Grid>
      <Grid item>
        <VersionUpdates />
      </Grid>
      <Grid item>
        <div style={{ marginTop: 5 }}>
          <TableStructure />
        </div>
      </Grid>
      {roles?.includes("admin") && (
        <Grid item>
          <div style={{ marginTop: 5 }}>
            <ApiServices />
          </div>
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

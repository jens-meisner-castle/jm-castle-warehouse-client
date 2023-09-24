import { Box, Grid, Typography } from "@mui/material";
import { useUserRoles } from "../../auth/AuthorizationProvider";
import { ApiServices } from "./parts/ApiServices";
import { HowToCreateCertificates } from "./parts/HowToCreateCertificates";
import { TableStructure } from "./parts/TableStructure";
import { VersionUpdates } from "./parts/VersionUpdates";
import { ThemeDetails } from "./parts/ThemeDetails";

export const Page = () => {
  const roles = useUserRoles();

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h5">{"Help"}</Typography>
      <VersionUpdates />
      <div style={{ marginTop: 5 }}>
        <TableStructure />
      </div>
      {roles?.includes("admin") && (
        <div style={{ marginTop: 5 }}>
          <ApiServices />
        </div>
      )}
      {roles?.includes("admin") && (
        <div style={{ marginTop: 5 }}>
          <HowToCreateCertificates />
        </div>
      )}
      <div style={{ marginTop: 5 }}>
        <ThemeDetails />
      </div>
    </Box>
  );
};

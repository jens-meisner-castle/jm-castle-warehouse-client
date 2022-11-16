import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SecurityIcon from "@mui/icons-material/Security";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { ApiServiceComponent } from "../../../components/ApiServiceComponent";
import { backendApiUrl } from "../../../configuration/Urls";
import { useApiServices } from "../../../hooks/useApiServices";

export const ApiServices = () => {
  const { apiServices, error } = useApiServices(backendApiUrl);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPrivateVisible, setIsPrivateVisible] = useState(false);
  const sortedPublicServices = useMemo(
    () =>
      apiServices &&
      apiServices
        .filter((s) => !s.scope || s.scope === "public")
        .sort((a, b) => a.url.localeCompare(b.url)),
    [apiServices]
  );
  const sortedPrivateServices = useMemo(
    () =>
      apiServices &&
      apiServices
        .filter((s) => s.scope === "private")
        .sort((a, b) => a.url.localeCompare(b.url)),
    [apiServices]
  );

  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <Typography component="span" variant="h6">
            {"Available Services (Api)"}
          </Typography>
          <IconButton onClick={() => setIsDetailsOpen((previous) => !previous)}>
            <MoreHorizIcon />
          </IconButton>
        </Paper>
      </Grid>
      {error && (
        <Grid item>
          <Typography>{error}</Typography>
        </Grid>
      )}
      {isDetailsOpen &&
        sortedPublicServices &&
        sortedPublicServices.map((service) => (
          <Grid key={service.url} item>
            <Paper style={{ marginTop: 5 }}>
              <ApiServiceComponent service={service} />
            </Paper>
          </Grid>
        ))}
      {isDetailsOpen && (
        <Grid item>
          <IconButton
            onClick={() => setIsPrivateVisible((previous) => !previous)}
          >
            <SecurityIcon />
          </IconButton>
        </Grid>
      )}
      {isDetailsOpen &&
        isPrivateVisible &&
        sortedPrivateServices &&
        sortedPrivateServices.map((service) => (
          <Grid key={service.url} item>
            <Paper style={{ marginTop: 5 }}>
              <ApiServiceComponent service={service} />
            </Paper>
          </Grid>
        ))}
    </Grid>
  );
};

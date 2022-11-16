import SecurityIcon from "@mui/icons-material/Security";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { ApiServiceComponent } from "../../components/ApiServiceComponent";
import { TextComponent } from "../../components/TextComponent";
import { backendApiUrl } from "../../configuration/Urls";
import { useApiServices } from "../../hooks/useApiServices";

export const Page = () => {
  const { apiServices, error } = useApiServices(backendApiUrl);
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
        <Typography variant="h5">{"Api services"}</Typography>
      </Grid>
      {error && (
        <Grid item>
          <Paper>
            <TextComponent value={error} />
          </Paper>
        </Grid>
      )}
      {sortedPublicServices &&
        sortedPublicServices.map((service, i) => (
          <Grid key={service.url} item>
            <Paper style={{ marginTop: i > 0 ? 5 : 0 }}>
              <ApiServiceComponent service={service} />
            </Paper>
          </Grid>
        ))}
      <Grid item>
        <Paper>
          <IconButton
            onClick={() => setIsPrivateVisible((previous) => !previous)}
          >
            <SecurityIcon />
          </IconButton>
        </Paper>
      </Grid>
      {isPrivateVisible &&
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

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Grid, IconButton, Typography } from "@mui/material";
import { TextareaComponent } from "jm-castle-components/build";
import { SerializableService } from "jm-castle-warehouse-types/build";
import { useMemo, useState } from "react";
import { backendApiUrl } from "../configuration/Urls";

export interface ApiServiceComponentProps {
  service: SerializableService;
}

export const ApiServiceComponent = (props: ApiServiceComponentProps) => {
  const { service } = props;
  const { url, method, name, parameters, neededRole } = service;
  const [isParamsSchemaOpen, setIsParamsSchemaOpen] = useState(false);
  const exampleQuery = useMemo(() => {
    const { properties, required } = parameters || {};
    const keyValuePairs = Object.keys(properties || {})
      .map(
        (key) => `${key}=${required?.includes(key) ? "<needed>" : "optional"}`
      )
      .join("&");
    return `${backendApiUrl}${url}${
      keyValuePairs.length ? "?" : ""
    }${keyValuePairs}`;
  }, [parameters, url]);
  const leftColumnWidth = 300;

  return (
    <Grid container direction="column">
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"URL"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{url}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"HTTP method"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{method}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Name"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{name}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Needed role"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{neededRole}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Example query"}</Typography>
          </Grid>
          <Grid item>
            <Typography>{exampleQuery}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography component="span">{"Parameters"}</Typography>
            {parameters && (
              <IconButton
                onClick={() => setIsParamsSchemaOpen((previous) => !previous)}
              >
                <MoreHorizIcon />
              </IconButton>
            )}
          </Grid>
          <Grid item flexGrow={1}>
            {isParamsSchemaOpen && parameters && (
              <TextareaComponent
                value={parameters}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
                formatObject
                maxRows={8}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { TextareaComponent } from "../../../components/TextareaComponent";

const updateDescriptions = [
  {
    version: "1.2.0",
    topic: "Server Konfiguration",
    toDos: [
      {
        index: 1,
        description: "Backup Ordner festlegen",
        example: {
          imageStore: { "...": "..." },
          systemBackupStore: {
            type: "file-system",
            path: "c:/castle-live/castle-warehouse-backup",
          },
        },
      },
      {
        index: 2,
        description: "Ordner für temporäre Dateien festlegen",
        example: {
          imageStore: { "...": "..." },
          tempStore: {
            type: "file-system",
            path: "c:/castle-live/castle-warehouse-temp",
          },
        },
      },
    ],
  },
];

export const VersionUpdates = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updates] = useState(updateDescriptions);

  const leftColumnWidth = 300;

  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <Typography component="span" variant="h6">
            {"Update Hinweise"}
          </Typography>
          <IconButton onClick={() => setIsDetailsOpen((previous) => !previous)}>
            <MoreHorizIcon />
          </IconButton>
        </Paper>
      </Grid>
      {isDetailsOpen &&
        updates.map((update) => (
          <Grid key={`${update.version}-${update.topic}`} item>
            <Paper style={{ marginTop: 5 }}>
              <Grid container direction="column">
                <Grid item>
                  <Grid container direction="row">
                    <Grid item style={{ width: leftColumnWidth }}>
                      <Typography>{"Version"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{update.version}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row">
                    <Grid item style={{ width: leftColumnWidth }}>
                      <Typography>{"Thema"}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{update.topic}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                {update.toDos.map((toDo) => (
                  <Grid item key={toDo.index}>
                    <Grid container direction="row">
                      <Grid item style={{ width: leftColumnWidth }}>
                        <Typography>{toDo.description}</Typography>
                      </Grid>
                      <Grid item flexGrow={1}>
                        <TextareaComponent
                          value={toDo.example || ""}
                          formatObject
                          maxRows={12}
                          style={{
                            width: "90%",
                            resize: "none",
                            marginRight: 30,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
    </Grid>
  );
};

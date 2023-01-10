import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../auth/AuthorizationProvider";
import { backendApiUrl } from "../configuration/Urls";
import { useHashtagSelect } from "../hooks/useHashtagSelect";
import { ErrorDisplay } from "./ErrorDisplay";

export interface HashtagSelectionDialogProps {
  handleCancel: () => void;
  handleAccept: (imageId: string) => void;
  hiddenHashtagIds?: string[];
}

export const HashtagSelectionDialog = (props: HashtagSelectionDialogProps) => {
  const [selected, setSelected] = useState("");
  const { handleAccept, handleCancel, hiddenHashtagIds } = props;
  const handleExpiredToken = useHandleExpiredToken();
  const { response, error, errorCode, errorDetails } = useHashtagSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { result } = response || {};
  const { rows } = result || {};
  const visibleRows = useMemo(() => {
    const filteredRows = hiddenHashtagIds
      ? rows?.filter((row) => !hiddenHashtagIds.includes(row.tag_id))
      : rows;
    return filteredRows
      ? filteredRows.sort((a, b) => a.tag_id.localeCompare(b.tag_id))
      : undefined;
  }, [rows, hiddenHashtagIds]);

  return (
    <Dialog open={true} onClose={handleCancel}>
      <DialogTitle>{"Hashtag auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Klicken Sie auf ein Hashtag, um es auszuwählen. Ein Doppelklick wählt ein Hashtag aus und schließt den Dialog."
          }
        </DialogContentText>
        {
          <ErrorDisplay
            error={error}
            errorCode={errorCode}
            errorDetails={errorDetails}
          />
        }
        <Grid container direction="row">
          {!visibleRows ||
            (!visibleRows.length && (
              <Grid item>
                <Typography>
                  {rows?.length
                    ? "Alle vorhandenen Hashtags sind bereits zugeordnet."
                    : "Es sind keine Hashtags vorhanden."}
                </Typography>
              </Grid>
            ))}
          {visibleRows?.map((row) => (
            <Grid key={row.tag_id} item>
              <Grid container direction="column">
                <Grid item>
                  <Chip
                    label={row.tag_id}
                    onClick={() => setSelected(row.tag_id)}
                    onDoubleClick={() => handleAccept(row.tag_id)}
                    variant={row.tag_id === selected ? "filled" : "outlined"}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!selected.length}
          onClick={() => handleAccept(selected)}
        >
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

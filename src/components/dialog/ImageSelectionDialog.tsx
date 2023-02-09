import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { useImageContentSelect } from "../../hooks/useImageContentSelect";
import { ErrorDisplay } from "../ErrorDisplay";

export interface ImageSelectionDialogProps {
  handleCancel: () => void;
  handleAccept: (imageId: string) => void;
  hiddenImageIds?: string[];
}

export const ImageSelectionDialog = (props: ImageSelectionDialogProps) => {
  const [selected, setSelected] = useState("");
  const { handleAccept, handleCancel, hiddenImageIds } = props;
  const theme = useTheme();
  const handleExpiredToken = useHandleExpiredToken();
  const { response, error, errorCode, errorDetails } = useImageContentSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { result } = response || {};
  const { rows } = result || {};
  const visibleRows = useMemo(() => {
    const filteredRows = hiddenImageIds
      ? rows?.filter((row) => !hiddenImageIds.includes(row.image_id))
      : rows;
    return filteredRows
      ? filteredRows.sort((a, b) => b.edited_at - a.edited_at)
      : undefined;
  }, [rows, hiddenImageIds]);

  return (
    <Dialog open={true} onClose={handleCancel}>
      <DialogTitle>{"Bild auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Klicken Sie auf ein Bild, um es auszuwählen. Ein Doppelklick wählt ein Bild aus und schließt den Dialog."
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
                    ? "Alle vorhandenen Bilder sind bereits zugeordnet."
                    : "Es sind keine Bilder vorhanden."}
                </Typography>
              </Grid>
            ))}
          {visibleRows?.map((row) => (
            <Grid key={row.image_id} item>
              <Grid container direction="column">
                <Grid item>
                  <Box
                    style={{
                      padding: 2,
                      backgroundColor:
                        row.image_id === selected
                          ? theme.palette.primary.main
                          : undefined,
                    }}
                  >
                    <img
                      onClick={() => setSelected(row.image_id)}
                      onDoubleClick={() => handleAccept(row.image_id)}
                      src={getImageDisplayUrl(backendApiUrl, row.image_id)}
                      alt={row.image_id}
                      style={{ maxWidth: 300 }}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <Typography variant="caption">{row.image_id}</Typography>
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

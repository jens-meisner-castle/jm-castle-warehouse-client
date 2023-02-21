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
import { useMasterdata } from "../../hooks/useMasterdata";
import { ErrorDisplays } from "../ErrorDisplays";

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

  const { rows, errors } = useMasterdata(
    backendApiUrl,
    { imageContent: true },
    1,
    handleExpiredToken
  );
  const { imageContentRows } = rows;

  const visibleRows = useMemo(() => {
    const filteredRows = hiddenImageIds
      ? imageContentRows?.filter((row) => !hiddenImageIds.includes(row.imageId))
      : imageContentRows;
    return filteredRows
      ? filteredRows.sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime())
      : undefined;
  }, [imageContentRows, hiddenImageIds]);

  const visibleRowsWarning =
    imageContentRows && visibleRows
      ? !imageContentRows.length
        ? "Es sind keine Bilder vorhanden."
        : !visibleRows.length
        ? "Alle vorhandenen Bilder sind bereits zugeordnet."
        : undefined
      : undefined;

  return (
    <Dialog open={true} onClose={handleCancel}>
      <DialogTitle>{"Bild auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Klicken Sie auf ein Bild, um es auszuwählen. Ein Doppelklick wählt ein Bild aus und schließt den Dialog."
          }
        </DialogContentText>
        <ErrorDisplays results={errors} />
        <Grid container direction="row">
          <Grid item>
            <Typography>{visibleRowsWarning}</Typography>
          </Grid>
          {visibleRows?.map((row) => (
            <Grid key={row.imageId} item>
              <Grid container direction="column">
                <Grid item>
                  <Box
                    style={{
                      padding: 2,
                      backgroundColor:
                        row.imageId === selected
                          ? theme.palette.primary.main
                          : undefined,
                    }}
                  >
                    <img
                      onClick={() => setSelected(row.imageId)}
                      onDoubleClick={() => handleAccept(row.imageId)}
                      src={getImageDisplayUrl(backendApiUrl, row.imageId)}
                      alt={row.imageId}
                      style={{ maxWidth: 300 }}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <Typography variant="caption">{row.imageId}</Typography>
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

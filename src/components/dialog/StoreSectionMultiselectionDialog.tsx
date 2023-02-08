import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useCallback, useState } from "react";
import { StoreSectionRow } from "../../types/RowTypes";

export interface StoreSectionMultiselectionDialogProps {
  initialSelection?: StoreSectionRow[];
  handleCancel: () => void;
  handleAccept: (hashtags: StoreSectionRow[]) => void;
  visibleStoreSections: StoreSectionRow[];
}

export const StoreSectionMultiselectionDialog = (
  props: StoreSectionMultiselectionDialogProps
) => {
  const { handleAccept, handleCancel, visibleStoreSections, initialSelection } =
    props;
  const [selected, setSelected] = useState<StoreSectionRow[]>(
    initialSelection || []
  );
  const handleClickOnTag = useCallback((row: StoreSectionRow) => {
    setSelected((previous) => {
      const index = previous.indexOf(row);
      const newSelection =
        index > -1
          ? [
              ...previous.slice(0, index),
              ...previous.slice(index + 1, previous.length),
            ]
          : [...previous, row];
      return newSelection;
    });
  }, []);

  return (
    <Dialog open={true} onClose={handleCancel}>
      <DialogTitle>{"Lagerbereiche auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Klicken Sie auf einen Lagerbereich, um die Auswahl zu ändern."}
        </DialogContentText>

        <Grid container direction="row">
          {visibleStoreSections?.map((row) => (
            <Grid key={row.sectionId} item>
              <Grid container direction="column">
                <Grid item>
                  <Chip
                    label={row.sectionId}
                    onClick={() => handleClickOnTag(row)}
                    variant={selected.includes(row) ? "filled" : "outlined"}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAccept(selected)}>{"Übernehmen"}</Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

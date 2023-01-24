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
import { HashtagRow } from "../../types/RowTypes";

export interface HashtagMultiselectionDialogProps {
  initialSelection?: HashtagRow[];
  handleCancel: () => void;
  handleAccept: (hashtags: HashtagRow[]) => void;
  visibleHashtags: HashtagRow[];
}

export const HashtagMultiselectionDialog = (
  props: HashtagMultiselectionDialogProps
) => {
  const { handleAccept, handleCancel, visibleHashtags, initialSelection } =
    props;
  const [selected, setSelected] = useState<HashtagRow[]>(
    initialSelection || []
  );
  const handleClickOnTag = useCallback((row: HashtagRow) => {
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
      <DialogTitle>{"Hashtag auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Klicken Sie auf ein Hashtag, um die Auswahl zu ändern."}
        </DialogContentText>

        <Grid container direction="row">
          {visibleHashtags?.map((row) => (
            <Grid key={row.tagId} item>
              <Grid container direction="column">
                <Grid item>
                  <Chip
                    label={row.tagId}
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
        <Button onClick={() => handleAccept(selected)}>{"Speichern"}</Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

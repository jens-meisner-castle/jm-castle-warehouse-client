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
import { Row_Hashtag } from "jm-castle-warehouse-types/build";
import { useCallback, useState } from "react";

export interface HashtagMultiselectionDialogProps {
  initialSelection?: string[];
  handleCancel: () => void;
  handleAccept: (tagIds: string[]) => void;
  visibleHashtags: Row_Hashtag[];
}

export const HashtagMultiselectionDialog = (
  props: HashtagMultiselectionDialogProps
) => {
  const { handleAccept, handleCancel, visibleHashtags, initialSelection } =
    props;
  const [selected, setSelected] = useState<string[]>(initialSelection || []);
  const handleClickOnTag = useCallback((tagId: string) => {
    setSelected((previous) => {
      const index = previous.indexOf(tagId);
      const newSelection =
        index > -1
          ? [
              ...previous.slice(0, index),
              ...previous.slice(index + 1, previous.length),
            ]
          : [...previous, tagId];
      console.log(newSelection);
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
            <Grid key={row.tag_id} item>
              <Grid container direction="column">
                <Grid item>
                  <Chip
                    label={row.tag_id}
                    onClick={() => handleClickOnTag(row.tag_id)}
                    variant={
                      selected.includes(row.tag_id) ? "filled" : "outlined"
                    }
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

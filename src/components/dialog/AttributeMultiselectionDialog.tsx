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
import { AttributeRow } from "../../types/RowTypes";

export interface AttributeMultiselectionDialogProps {
  initialSelection?: AttributeRow[];
  handleCancel: () => void;
  handleAccept: (hashtags: AttributeRow[]) => void;
  visibleAttributes: AttributeRow[];
}

export const AttributeMultiselectionDialog = (
  props: AttributeMultiselectionDialogProps
) => {
  const { handleAccept, handleCancel, visibleAttributes, initialSelection } =
    props;
  const [selected, setSelected] = useState<AttributeRow[]>(
    initialSelection || []
  );
  const handleClickOnTag = useCallback((row: AttributeRow) => {
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
      <DialogTitle>{"Attribute auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Klicken Sie auf ein Attribut, um die Auswahl zu ändern."}
        </DialogContentText>

        <Grid container direction="row">
          {visibleAttributes?.map((row) => (
            <Grid key={row.attributeId} item>
              <Grid container direction="column">
                <Grid item>
                  <Chip
                    label={row.attributeId}
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

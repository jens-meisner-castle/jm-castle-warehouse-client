import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";

export interface ExportImportActiveDialogProps {
  handleClose: () => void;
  heading: string;
  description: string;
}

export const ExportImportActiveDialog = (
  props: ExportImportActiveDialogProps
) => {
  const { heading, description, handleClose } = props;

  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>{heading}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        <Grid container direction="column">
          <Grid item>
            <DoNotDisturbIcon />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{"Schließen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

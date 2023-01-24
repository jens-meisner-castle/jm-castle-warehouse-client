import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

export interface ShowQrCodeDialogProps {
  handleClose: () => void;
  heading: string;
  description: string;
  codeContent: string;
}

export const ShowQrCodeDialog = (props: ShowQrCodeDialogProps) => {
  const { heading, description, codeContent, handleClose } = props;

  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>{heading}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        <Grid container direction="column">
          <Grid item>
            <QRCodeCanvas includeMargin value={codeContent} />
          </Grid>
          <Grid item>
            <Typography>{codeContent}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{"Schließen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

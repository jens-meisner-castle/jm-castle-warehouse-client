import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";
import { EmissionRow, StoreSectionRow } from "../../../../types/RowTypes";

export interface CreateEmissionDialogProps {
  receipt: EmissionRow;
  storeSections: StoreSectionRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (receipt: EmissionRow) => void;
}

export const CreateEmissionDialog = (props: CreateEmissionDialogProps) => {
  const { receipt, handleAccept, handleCancel, open, storeSections } = props;
  const [data, setData] = useState(receipt);
  const updateData = (updates: Partial<EmissionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { articleId, articleCount, sectionId } = data;

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Ausgang"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="articleId"
          label="Artikel"
          value={articleId}
          onChange={(s) => updateData({ articleId: s })}
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="articleCount"
          label="Anzahl"
          value={articleCount}
          onChange={(event) => {
            const articleCount = Number.parseInt(event.target.value);
            typeof articleCount === "number" && updateData({ articleCount });
          }}
          type="number"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="sectionId"
          select
          label="Lagerbereich"
          value={sectionId}
          onChange={(event) => updateData({ sectionId: event.target.value })}
          helperText="Bitte wählen Sie einen Lagerbereich aus"
          fullWidth
          variant="standard"
        >
          {storeSections.map((row) => (
            <MenuItem key={row.sectionId} value={row.sectionId}>
              {row.sectionId}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={
            !articleId.length || articleCount === 0 || !sectionId.length
          }
          onClick={() => handleAccept(data)}
        >
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

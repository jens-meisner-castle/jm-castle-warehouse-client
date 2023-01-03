import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { CountUnits, isCountUnit } from "jm-castle-warehouse-types/build";
import { useMemo, useState } from "react";
import { ArticleRow } from "../../../../types/RowTypes";

export interface CreateArticleDialogProps {
  article: ArticleRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (article: ArticleRow) => void;
}

export const CreateArticleDialog = (props: CreateArticleDialogProps) => {
  const { article, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(article);
  const updateData = (updates: Partial<ArticleRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const countUnits = useMemo(
    () =>
      Object.keys(CountUnits).map((k) => ({
        id: k,
        name: CountUnits[k as keyof typeof CountUnits].name,
      })),
    []
  );

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Neuer Artikel</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="articleId"
          label="Artikel"
          value={data.articleId}
          onChange={(event) => updateData({ articleId: event.target.value })}
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="name"
          label="Name"
          value={data.name}
          onChange={(event) => updateData({ name: event.target.value })}
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="countUnit"
          select
          label="Zähleinheit"
          value={data.countUnit}
          onChange={(event) => {
            isCountUnit(event.target.value) &&
              updateData({ countUnit: event.target.value });
          }}
          helperText="Bitte wählen Sie eine Zähleinheit aus"
          variant="standard"
        >
          {countUnits.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {`${unit.id} (${unit.name})`}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAccept(data)}>Speichern</Button>
        <Button onClick={handleCancel}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

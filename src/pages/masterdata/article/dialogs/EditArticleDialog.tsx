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
import { HashtagsEditor } from "../../../../components/HashtagsEditor";
import { ImageRefsEditor } from "../../../../components/ImageRefsEditor";
import { TextFieldWithSpeech } from "../../../../components/TextFieldWithSpeech";

import { ArticleRow } from "../../../../types/RowTypes";

export interface EditArticleDialogProps {
  article: ArticleRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ArticleRow) => void;
}

export const EditArticleDialog = (props: EditArticleDialogProps) => {
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
  const { articleId, name, countUnit, imageRefs, hashtags, wwwLink } = data;
  const isSavingAllowed = !!articleId && !!name && !!countUnit;

  return (
    <>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>{"Artikel bearbeiten"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              "Führen Sie Ihre Änderungen durch und drücken Sie am Ende 'Speichern'."
            }
          </DialogContentText>
          <TextField
            disabled
            margin="dense"
            id="articleId"
            label="Artikel"
            value={articleId}
            type="text"
            fullWidth
            variant="standard"
          />
          <TextFieldWithSpeech
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            value={name}
            onChange={(s) => {
              updateData({ name: s });
            }}
            fullWidth
            variant="standard"
          />
          <HashtagsEditor
            hashtags={hashtags}
            onChange={(hashtags) => updateData({ hashtags })}
          />
          <TextField
            margin="dense"
            id="wwwLink"
            label="Link (www)"
            value={wwwLink}
            onChange={(event) => updateData({ wwwLink: event.target.value })}
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="countUnit"
            select
            label="Zähleinheit"
            value={countUnit}
            onChange={(event) => {
              isCountUnit(event.target.value) &&
                updateData({ countUnit: event.target.value });
            }}
            helperText="Bitte wählen Sie eine Zähleinheit aus"
            fullWidth
            variant="standard"
          >
            {countUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {`${unit.id} (${unit.name})`}
              </MenuItem>
            ))}
          </TextField>
          <ImageRefsEditor
            imageRefs={imageRefs}
            onChange={(imageRefs) => updateData({ imageRefs })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!isSavingAllowed}
            onClick={() => handleAccept(data)}
          >
            {"Speichern"}
          </Button>
          <Button onClick={handleCancel}>{"Abbrechen"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

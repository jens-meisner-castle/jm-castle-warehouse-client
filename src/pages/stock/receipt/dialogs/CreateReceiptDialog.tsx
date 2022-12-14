import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { CountUnits } from "jm-castle-warehouse-types/build";
import { useMemo, useState } from "react";
import { ArticleRefEditor } from "../../../../components/ArticleRefEditor";
import { ImageRefsEditor } from "../../../../components/ImageRefsEditor";
import {
  ArticleRow,
  ReceiptRow,
  StoreSectionRow,
} from "../../../../types/RowTypes";

export interface CreateReceiptDialogProps {
  receipt: ReceiptRow;
  articles: ArticleRow[];
  storeSections: StoreSectionRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (receipt: ReceiptRow) => void;
}

export const CreateReceiptDialog = (props: CreateReceiptDialogProps) => {
  const { receipt, handleAccept, handleCancel, open, storeSections, articles } =
    props;
  const [data, setData] = useState(receipt);
  const updateData = (updates: Partial<ReceiptRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { articleId, articleCount, sectionId, imageRefs, wwwLink } = data;
  const currentArticle = useMemo(() => {
    return articles.find((row) => row.articleId === articleId);
  }, [articles, articleId]);
  const currentCountUnit = currentArticle
    ? CountUnits[currentArticle.countUnit]
    : undefined;
  const countLabel = currentCountUnit
    ? `Anzahl (${currentCountUnit.name})`
    : "Anzahl";

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Eingang"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <ArticleRefEditor
          autoFocus
          margin="dense"
          id="articleId"
          label="Artikel"
          articles={articles}
          value={currentArticle}
          onChange={(row) => updateData({ articleId: row?.articleId })}
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="articleCount"
          label={countLabel}
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
        <ImageRefsEditor
          imageRefs={imageRefs}
          onChange={(imageRefs) =>
            setData((previous) => ({ ...previous, imageRefs }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={
            !articleId?.length || articleCount === 0 || !sectionId.length
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

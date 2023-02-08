import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { ArticleEditor } from "../../../../components/row-editor/ArticleEditor";

import {
  ArticleRow,
  AttributeRow,
  HashtagRow,
  isSavingArticleAllowed,
  ManufacturerRow,
} from "../../../../types/RowTypes";

export interface EditArticleDialogProps {
  article: ArticleRow;
  availableHashtags: HashtagRow[];
  availableManufacturers: ManufacturerRow[];
  availableAttributes: AttributeRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ArticleRow) => void;
}

export const EditArticleDialog = (props: EditArticleDialogProps) => {
  const {
    article,
    availableHashtags,
    availableManufacturers,
    availableAttributes,
    handleAccept,
    handleCancel,
    open,
  } = props;

  const [data, setData] = useState(article);

  const updateData = (updates: Partial<ArticleRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };

  const { isSavingAllowed } = isSavingArticleAllowed(data);

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
          <ArticleEditor
            mode="edit"
            row={data || {}}
            onChange={updateData}
            availableManufacturers={availableManufacturers}
            availableHashtags={availableHashtags}
            availableAttributes={availableAttributes}
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

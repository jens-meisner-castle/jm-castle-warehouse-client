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
import { useHandleExpiredToken } from "../../../../auth/AuthorizationProvider";
import { ArticleRefEditor } from "../../../../components/ArticleRefEditor";
import { ErrorData, ErrorDisplays } from "../../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../../configuration/Urls";
import { useStockArticleSelect } from "../../../../hooks/useStockArticleSelect";
import {
  ArticleRow,
  EmissionRow,
  StoreSectionRow,
} from "../../../../types/RowTypes";

export interface CreateEmissionDialogProps {
  receipt: EmissionRow;
  articles: ArticleRow[];
  storeSections: StoreSectionRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (receipt: EmissionRow) => void;
}

export const CreateEmissionDialog = (props: CreateEmissionDialogProps) => {
  const { receipt, handleAccept, handleCancel, open, storeSections, articles } =
    props;
  const [data, setData] = useState(receipt);
  const updateData = (updates: Partial<EmissionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { articleId, articleCount, sectionId } = data;
  const handleExpiredToken = useHandleExpiredToken();
  const currentArticle = useMemo(() => {
    return articles.find((row) => row.articleId === articleId);
  }, [articles, articleId]);
  const currentCountUnit = currentArticle
    ? CountUnits[currentArticle.countUnit]
    : undefined;
  const countLabel = currentCountUnit
    ? `Anzahl (${currentCountUnit.name})`
    : "Anzahl";
  const stockApiResponse = useStockArticleSelect(
    backendApiUrl,
    currentArticle?.articleId,
    currentArticle ? 1 : 0,
    handleExpiredToken
  );
  const { response: stockState } = stockApiResponse;
  const availableCount = useMemo(() => {
    if (!stockState) {
      return undefined;
    }
    const total = stockState.states.reduce((sum, state) => {
      return sum + state.articleCount;
    }, 0);
    const selectedSection = stockState.states.find(
      (state) => state.section.section_id === sectionId
    );
    return { total, inSelectedSection: selectedSection?.articleCount || 0 };
  }, [stockState, sectionId]);
  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.stockState = stockApiResponse;
    return newData;
  }, [stockApiResponse]);
  const availableCountLabel = availableCount
    ? `Verfügbare Menge (ges: ${availableCount.total})`
    : "";
  const availableCountValue = availableCount
    ? `${availableCount.inSelectedSection} im gewählten Lager`
    : "";

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Ausgang"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <ErrorDisplays results={errorData} />
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
        <TextField
          disabled
          margin="dense"
          id="availableCount"
          label={availableCountLabel}
          value={availableCountValue}
          type="text"
          fullWidth
          variant="standard"
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

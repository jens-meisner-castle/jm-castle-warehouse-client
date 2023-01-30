import { MenuItem, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { CountUnits, ReceiptReasons } from "jm-castle-warehouse-types/build";
import { useMemo, useState } from "react";
import { ArticleRefAutocomplete } from "../../../../components/autocomplete/ArticleRefAutocomplete";
import { CostunitRefAutocomplete } from "../../../../components/autocomplete/CostunitRefAutocomplete";
import { StoreSectionRefAutocomplete } from "../../../../components/autocomplete/StoreSectionRefAutocomplete";
import { CountField } from "../../../../components/CountField";
import { DateField } from "../../../../components/DateField";
import { ImageRefsEditor } from "../../../../components/multi-ref/ImageRefsEditor";
import { PriceField } from "../../../../components/PriceField";
import {
  ArticleRow,
  CostunitRow,
  isSavingReceiptAllowed,
  ReceiptRow,
  StoreSectionRow,
} from "../../../../types/RowTypes";

export interface CreateReceiptDialogProps {
  receipt: ReceiptRow;
  articles: ArticleRow[];
  storeSections: StoreSectionRow[];
  costunits: CostunitRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (receipt: ReceiptRow) => void;
}

export const CreateReceiptDialog = (props: CreateReceiptDialogProps) => {
  const {
    receipt,
    handleAccept,
    handleCancel,
    open,
    storeSections,
    costunits,
    articles,
  } = props;
  const [data, setData] = useState(receipt);
  const theme = useTheme();
  const updateData = (updates: Partial<ReceiptRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const {
    articleId,
    articleCount,
    sectionId,
    imageRefs,
    wwwLink,
    receiptAt,
    reason,
    costUnit,
    price,
  } = data;

  const currentSection = useMemo(
    () => storeSections.find((r) => r.sectionId === sectionId),
    [storeSections, sectionId]
  );
  const currentCostunit = useMemo(
    () => costunits.find((r) => r.unitId === costUnit),
    [costunits, costUnit]
  );
  const currentArticle = useMemo(() => {
    return articles.find((row) => row.articleId === articleId);
  }, [articles, articleId]);

  const orderedReasons = useMemo(() => {
    const ordered: { id: string; name: string }[] = [];
    Object.keys(ReceiptReasons).forEach((k) =>
      ordered.push({
        id: k,
        name: ReceiptReasons[k as keyof typeof ReceiptReasons].name,
      })
    );
    return ordered;
  }, []);

  const currentCountUnit = currentArticle
    ? CountUnits[currentArticle.countUnit]
    : undefined;

  const countLabel = currentCountUnit
    ? `Anzahl (${currentCountUnit.name})`
    : "Anzahl";

  const { isSavingAllowed, errorData } = isSavingReceiptAllowed(data);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{"Neuer Eingang"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Füllen Sie die notwendigen Felder aus und drücken Sie am Ende 'Speichern'."
          }
        </DialogContentText>
        <ArticleRefAutocomplete
          autoFocus
          margin="dense"
          id="articleId"
          label="Artikel"
          articles={articles}
          value={currentArticle}
          errorData={errorData.articleId}
          onChange={(row) => updateData({ articleId: row?.articleId })}
          fullWidth
          variant="standard"
          helperText={
            articles.length ? (
              "Bitte wählen Sie einen Artikel aus"
            ) : (
              <span style={{ color: theme.palette.error.main }}>
                {
                  "Es sind keine Artikel vorhanden. Sie müssen zuerst einen Artikel anlegen."
                }
              </span>
            )
          }
        />
        <CountField
          margin="dense"
          id="articleCount"
          label={countLabel}
          value={articleCount || null}
          errorData={errorData.articleCount}
          onChange={(value) => {
            updateData({ articleCount: value || undefined });
          }}
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
        <PriceField
          margin="dense"
          id="price"
          label={"Preis (€)"}
          value={price || null}
          onChange={(value) => {
            updateData({ price: value || undefined });
          }}
          fullWidth
          variant="standard"
        />
        <StoreSectionRefAutocomplete
          value={currentSection}
          sections={storeSections}
          onChange={(section) => updateData({ sectionId: section?.sectionId })}
          fullWidth
          variant="standard"
          margin="dense"
        />
        <DateField
          value={receiptAt}
          level="minute"
          onChange={(value) => updateData({ receiptAt: value })}
          label="empfangen um"
          variant="standard"
          fullWidth
        />
        <TextField
          margin="dense"
          id="reason"
          select
          label="Grund"
          value={reason || ""}
          onChange={(event) =>
            updateData({
              reason: event.target.value as keyof typeof ReceiptReasons,
            })
          }
          helperText="Bitte wählen Sie einen Grund aus"
          fullWidth
          variant="standard"
        >
          {orderedReasons.map((reason) => (
            <MenuItem key={reason.id} value={reason.id}>
              {`${reason.name}`}
            </MenuItem>
          ))}
        </TextField>
        <CostunitRefAutocomplete
          value={currentCostunit}
          costunits={costunits}
          onChange={(costunit) => updateData({ costUnit: costunit?.unitId })}
          fullWidth
          variant="standard"
          margin="dense"
        />
        <ImageRefsEditor
          imageRefs={imageRefs}
          onChange={(imageRefs) =>
            setData((previous) => ({ ...previous, imageRefs }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={!isSavingAllowed} onClick={() => handleAccept(data)}>
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

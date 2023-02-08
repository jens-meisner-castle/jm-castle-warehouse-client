import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import {
  CountUnits,
  EmissionReasons,
  Row_StoreSection,
} from "jm-castle-warehouse-types/build";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../../auth/AuthorizationProvider";
import { ArticleRefAutocomplete } from "../../../../components/autocomplete/ArticleRefAutocomplete";
import { CostunitRefAutocomplete } from "../../../../components/autocomplete/CostunitRefAutocomplete";
import { ReceiverRefAutocomplete } from "../../../../components/autocomplete/ReceiverRefAutocomplete";
import { StoreSectionRefAutocomplete } from "../../../../components/autocomplete/StoreSectionRefAutocomplete";
import { CountField } from "../../../../components/CountField";
import { DateField } from "../../../../components/DateField";
import { ErrorData, ErrorDisplays } from "../../../../components/ErrorDisplays";
import { ImageRefsEditor } from "../../../../components/multi-ref/ImageRefsEditor";
import { PriceField } from "../../../../components/PriceField";
import { backendApiUrl } from "../../../../configuration/Urls";
import { useStockArticleSelect } from "../../../../hooks/useStockArticleSelect";
import {
  ArticleRow,
  CostunitRow,
  EmissionRow,
  isSavingEmissionAllowed,
  ReceiverRow,
  StoreSectionRow,
} from "../../../../types/RowTypes";

export interface CreateEmissionDialogProps {
  receipt: EmissionRow;
  articles: ArticleRow[];
  storeSections: StoreSectionRow[];
  receivers: ReceiverRow[];
  costunits: CostunitRow[];
  open: boolean;
  handleCancel: () => void;
  handleAccept: (receipt: EmissionRow) => void;
}

export const CreateEmissionDialog = (props: CreateEmissionDialogProps) => {
  const {
    receipt,
    handleAccept,
    handleCancel,
    open,
    storeSections,
    articles,
    receivers,
    costunits,
  } = props;
  const [data, setData] = useState(receipt);
  const updateData = (updates: Partial<EmissionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const {
    articleId,
    articleCount,
    sectionId,
    reason,
    receiver,
    emittedAt,
    price,
    imageRefs,
    costUnit,
  } = data;

  const handleExpiredToken = useHandleExpiredToken();

  const currentArticle = useMemo(() => {
    return articles.find((row) => row.articleId === articleId);
  }, [articles, articleId]);

  const currentReceiver = useMemo(() => {
    return receivers.find((row) => row.receiverId === receiver);
  }, [receivers, receiver]);

  const currentCostunit = useMemo(() => {
    return costunits.find((row) => row.unitId === costUnit);
  }, [costunits, costUnit]);

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
    const perSection: Record<
      string,
      {
        section: Row_StoreSection;
        physicalCount: number;
        availableCount: number;
      }
    > = {};
    stockState.states.forEach(
      (state) => (perSection[state.section.section_id] = state)
    );
    const totalPhysical = stockState.states.reduce((sum, state) => {
      return sum + state.physicalCount;
    }, 0);
    const totalAvailable = stockState.states.reduce((sum, state) => {
      return sum + state.availableCount;
    }, 0);
    const selectedSection = stockState.states.find(
      (state) => state.section.section_id === sectionId
    );
    return {
      totalPhysical,
      totalAvailable,
      perSection,
      selectedSection,
    };
  }, [stockState, sectionId]);

  const orderedSections = useMemo(() => {
    const ordered: Array<
      StoreSectionRow & { _physicalCount: number; _availableCount: number }
    > = availableCount
      ? [...storeSections]
          .sort(
            (a, b) =>
              (availableCount.perSection[b.sectionId]
                ? availableCount.perSection[b.sectionId].physicalCount
                : -1) -
              (availableCount.perSection[a.sectionId]
                ? availableCount.perSection[a.sectionId].physicalCount
                : -1)
          )
          .map((section) => ({
            ...section,
            _physicalCount:
              availableCount.perSection[section.sectionId]?.physicalCount || 0,
            _availableCount:
              availableCount.perSection[section.sectionId]?.availableCount || 0,
          }))
      : storeSections.map((section) => ({
          ...section,
          _physicalCount: 0,
          _availableCount: 0,
        }));
    return ordered;
  }, [availableCount, storeSections]);

  const currentSection = useMemo(
    () => orderedSections.find((r) => r.sectionId === sectionId),
    [orderedSections, sectionId]
  );

  const getSectionLabel = (section: typeof orderedSections[0]) =>
    `${section.sectionId} (Lager: ${section._physicalCount}, verfügbar: ${section._availableCount})`;

  const orderedReasons = useMemo(() => {
    const ordered: { id: string; name: string }[] = [];
    Object.keys(EmissionReasons).forEach((k) =>
      ordered.push({
        id: k,
        name: EmissionReasons[k as keyof typeof EmissionReasons].name,
      })
    );
    return ordered;
  }, []);

  const { isSavingAllowed, errorData: fieldErrorData } =
    isSavingEmissionAllowed(data);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.stockState = stockApiResponse;
    return newData;
  }, [stockApiResponse]);

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
        <ArticleRefAutocomplete
          autoFocus
          margin="dense"
          id="articleId"
          label="Artikel"
          articles={articles}
          value={currentArticle}
          errorData={fieldErrorData.articleId}
          onChange={(row) => updateData({ articleId: row?.articleId })}
          fullWidth
          variant="standard"
        />
        <CountField
          margin="dense"
          id="articleCount"
          label={countLabel}
          value={articleCount || null}
          errorData={fieldErrorData.articleCount}
          onChange={(value) => {
            updateData({ articleCount: value || undefined });
          }}
          fullWidth
          variant="standard"
        />
        <CostunitRefAutocomplete
          margin="dense"
          id="costunit"
          label="Kostenstelle"
          costunits={costunits}
          value={currentCostunit}
          errorData={fieldErrorData.costUnit}
          onChange={(row) => updateData({ costUnit: row?.unitId })}
          fullWidth
          variant="standard"
          helperText={
            receivers.length
              ? "Bitte wählen Sie eine Kostenstelle aus"
              : "Es sind keine Kostenstellen vorhanden. Sie müssen zuerst eine Kostenstelle anlegen."
          }
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
        <ReceiverRefAutocomplete
          margin="dense"
          id="receiver"
          label="Empfänger"
          receivers={receivers}
          value={currentReceiver}
          errorData={fieldErrorData.receiver}
          onChange={(row) => updateData({ receiver: row?.receiverId })}
          fullWidth
          variant="standard"
          helperText={
            receivers.length
              ? "Bitte wählen Sie einen Empfänger aus"
              : "Es sind keine Empfänger vorhanden. Sie müssen zuerst einen Empfänger anlegen."
          }
        />
        <StoreSectionRefAutocomplete
          value={currentSection}
          errorData={fieldErrorData.sectionId}
          getOptionLabel={getSectionLabel}
          sections={orderedSections}
          onChange={(section) => updateData({ sectionId: section?.sectionId })}
          fullWidth
          variant="standard"
          margin="dense"
        />
        <DateField
          value={emittedAt}
          level="minute"
          onChange={(value) => updateData({ emittedAt: value })}
          label="ausgegeben um"
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
              reason: event.target.value as keyof typeof EmissionReasons,
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

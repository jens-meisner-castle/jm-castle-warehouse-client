import { MenuItem, useTheme } from "@mui/material";
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
import { ReceiverRefEditor } from "../../../../components/autocomplete/ReceiverRefAutocomplete";
import { StoreSectionRefAutocomplete } from "../../../../components/autocomplete/StoreSectionRefAutocomplete";
import { DateField } from "../../../../components/DateField";
import { ErrorData, ErrorDisplays } from "../../../../components/ErrorDisplays";
import { backendApiUrl } from "../../../../configuration/Urls";
import { useStockArticleSelect } from "../../../../hooks/useStockArticleSelect";
import {
  ArticleRow,
  EmissionRow,
  ReceiverRow,
  StoreSectionRow,
} from "../../../../types/RowTypes";

export interface CreateEmissionDialogProps {
  receipt: EmissionRow;
  articles: ArticleRow[];
  storeSections: StoreSectionRow[];
  receivers: ReceiverRow[];
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
  } = props;
  const theme = useTheme();
  const [data, setData] = useState(receipt);
  const updateData = (updates: Partial<EmissionRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const { articleId, articleCount, sectionId, reason, receiver, emittedAt } =
    data;

  const handleExpiredToken = useHandleExpiredToken();

  const currentArticle = useMemo(() => {
    return articles.find((row) => row.articleId === articleId);
  }, [articles, articleId]);

  const currentReceiver = useMemo(() => {
    return receivers.find((row) => row.receiverId === receiver);
  }, [receivers, receiver]);

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

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.stockState = stockApiResponse;
    return newData;
  }, [stockApiResponse]);

  const isSavingAllowed =
    articleId?.length &&
    articleCount > 0 &&
    sectionId.length &&
    reason?.length &&
    receiver?.length;

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
        <ReceiverRefEditor
          autoFocus
          margin="dense"
          id="receiver"
          label="Empfänger"
          receivers={receivers}
          value={currentReceiver}
          onChange={(row) => updateData({ receiver: row?.receiverId })}
          fullWidth
          variant="standard"
          helperText={
            receivers.length ? (
              "Bitte wählen Sie einen Empfänger aus"
            ) : (
              <span style={{ color: theme.palette.error.main }}>
                {
                  "Es sind keine Empfänger vorhanden. Sie müssen zuerst einen Empfänger anlegen."
                }
              </span>
            )
          }
        />
        <StoreSectionRefAutocomplete
          value={currentSection}
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

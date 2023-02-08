import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, TextField, useTheme } from "@mui/material";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import { StoreSectionRow } from "../../types/RowTypes";
import { StoreSectionMultiselectionDialog } from "../dialog/StoreSectionMultiselectionDialog";

export interface StoreSectionsRefEditorProps {
  value: StoreSectionRow[] | undefined;
  onChange: (storeSections: StoreSectionRow[] | undefined) => void;
  storeSections: StoreSectionRow[];
}

export const StoreSectionsRefEditor = (props: StoreSectionsRefEditorProps) => {
  const { storeSections, onChange, value } = props;
  const theme = useTheme();

  const iconButtonStyle: CSSProperties = { padding: 4 };

  const [isStoreSectionAddOpen, setIsStoreSectionAddOpen] = useState(false);
  const [isStoreSectionRemoveOpen, setIsStoreSectionRemoveOpen] =
    useState(false);

  const handleAcceptNewStoreSections = useCallback(
    (newRows: StoreSectionRow[]) => {
      setIsStoreSectionAddOpen(false);
      const newStoreSections = value ? [...value, ...newRows] : [...newRows];
      onChange(newStoreSections);
    },
    [value, onChange]
  );

  const handleAcceptRemovedStoreSections = useCallback(
    (newRows: StoreSectionRow[]) => {
      setIsStoreSectionRemoveOpen(false);
      onChange(newRows.length ? newRows : undefined);
    },
    [onChange]
  );

  const currentStoreSectionRows = value || [];

  const notSelectedStoreSectionRows = useMemo(() => {
    const notSelectedRows: StoreSectionRow[] = [];
    storeSections.forEach((row) => {
      !value?.includes(row) && notSelectedRows.push(row);
    });
    return notSelectedRows;
  }, [storeSections, value]);

  return (
    <>
      {isStoreSectionAddOpen && (
        <StoreSectionMultiselectionDialog
          visibleStoreSections={notSelectedStoreSectionRows}
          handleAccept={(tagIds) => handleAcceptNewStoreSections(tagIds)}
          handleCancel={() => setIsStoreSectionAddOpen(false)}
        />
      )}
      {isStoreSectionRemoveOpen && value && currentStoreSectionRows && (
        <StoreSectionMultiselectionDialog
          initialSelection={value}
          visibleStoreSections={currentStoreSectionRows}
          handleAccept={(tagIds) => handleAcceptRemovedStoreSections(tagIds)}
          handleCancel={() => setIsStoreSectionRemoveOpen(false)}
        />
      )}
      <TextField
        margin="dense"
        id="storeSections"
        label="Lagerbereiche"
        value={value ? value.map((r) => r.sectionId).join(", ") : ""}
        type="text"
        fullWidth
        variant="standard"
        tabIndex={-1}
        InputProps={{
          endAdornment: (
            <>
              <IconButton
                style={iconButtonStyle}
                disabled={!value}
                onClick={() => setIsStoreSectionRemoveOpen(true)}
              >
                <RemoveIcon />
              </IconButton>
              <IconButton
                style={iconButtonStyle}
                disabled={notSelectedStoreSectionRows.length < 1}
                onClick={() => setIsStoreSectionAddOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </>
          ),
        }}
        helperText={
          storeSections?.length ? (
            "Verwenden Sie die Schaltflächen, um Lagerbereiche hinzuzufügen oder zu entfernen."
          ) : (
            <span style={{ color: theme.palette.warning.main }}>
              {
                "Es sind keine Lagerbereiche vorhanden. Sie müssen zuerst einen Lagerbereich anlegen."
              }
            </span>
          )
        }
      />
    </>
  );
};

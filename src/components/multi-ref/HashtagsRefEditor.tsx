import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, TextField, useTheme } from "@mui/material";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import { HashtagRow } from "../../types/RowTypes";
import { HashtagMultiselectionDialog } from "../dialog/HashtagMultiselectionDialog";

export interface HashtagsRefEditorProps {
  value: HashtagRow[] | undefined;
  onChange: (hashtags: HashtagRow[] | undefined) => void;
  hashtags: HashtagRow[];
}

export const HashtagsRefEditor = (props: HashtagsRefEditorProps) => {
  const { hashtags, onChange, value } = props;
  const theme = useTheme();

  const iconButtonStyle: CSSProperties = { padding: 4 };

  const [isHashtagAddOpen, setIsHashtagAddOpen] = useState(false);
  const [isHashtagRemoveOpen, setIsHashtagRemoveOpen] = useState(false);

  const handleAcceptNewHashtags = useCallback(
    (newRows: HashtagRow[]) => {
      setIsHashtagAddOpen(false);
      const newHashtags = value ? [...value, ...newRows] : [...newRows];
      onChange(newHashtags);
    },
    [value, onChange]
  );

  const handleAcceptRemovedHashtags = useCallback(
    (newRows: HashtagRow[]) => {
      setIsHashtagRemoveOpen(false);
      onChange(newRows.length ? newRows : undefined);
    },
    [onChange]
  );

  const currentHashtagRows = value || [];

  const notSelectedHashtagRows = useMemo(() => {
    const notSelectedRows: HashtagRow[] = [];
    hashtags.forEach((row) => {
      !value?.includes(row) && notSelectedRows.push(row);
    });
    return notSelectedRows;
  }, [hashtags, value]);

  return (
    <>
      {isHashtagAddOpen && (
        <HashtagMultiselectionDialog
          visibleHashtags={notSelectedHashtagRows}
          handleAccept={(tagIds) => handleAcceptNewHashtags(tagIds)}
          handleCancel={() => setIsHashtagAddOpen(false)}
        />
      )}
      {isHashtagRemoveOpen && value && currentHashtagRows && (
        <HashtagMultiselectionDialog
          initialSelection={value}
          visibleHashtags={currentHashtagRows}
          handleAccept={(tagIds) => handleAcceptRemovedHashtags(tagIds)}
          handleCancel={() => setIsHashtagRemoveOpen(false)}
        />
      )}
      <TextField
        margin="dense"
        id="hashtags"
        label="Hashtags"
        value={value ? value.map((r) => r.tagId).join(", ") : ""}
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
                onClick={() => setIsHashtagRemoveOpen(true)}
              >
                <RemoveIcon />
              </IconButton>
              <IconButton
                style={iconButtonStyle}
                disabled={notSelectedHashtagRows.length < 1}
                onClick={() => setIsHashtagAddOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </>
          ),
        }}
        helperText={
          hashtags?.length ? (
            "Verwenden Sie die Schaltflächen, um Tags hinzuzufügen oder zu entfernen."
          ) : (
            <span style={{ color: theme.palette.warning.main }}>
              {
                "Es sind keine Hashtags vorhanden. Sie müssen zuerst ein Hashtag anlegen."
              }
            </span>
          )
        }
      />
    </>
  );
};

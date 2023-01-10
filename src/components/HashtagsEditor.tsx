import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Alert, IconButton, Snackbar, TextField } from "@mui/material";
import { Row_Hashtag } from "jm-castle-warehouse-types/build";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../auth/AuthorizationProvider";
import { backendApiUrl } from "../configuration/Urls";
import { useHashtagSelect } from "../hooks/useHashtagSelect";
import { ErrorDisplay } from "./ErrorDisplay";
import { HashtagMultiselectionDialog } from "./HashtagMultiselectionDialog";

export interface HashtagsEditorProps {
  hashtags: string[] | undefined;
  onChange: (hashtags: string[] | undefined) => void;
}

export const HashtagsEditor = (props: HashtagsEditorProps) => {
  const { hashtags, onChange } = props;
  const [editorWarning, setEditorWarning] = useState<string | undefined>(
    undefined
  );
  const [isHashtagAddOpen, setIsHashtagAddOpen] = useState(false);
  const [isHashtagRemoveOpen, setIsHashtagRemoveOpen] = useState(false);

  const handleExpiredToken = useHandleExpiredToken();

  const handleAcceptNewHashtags = useCallback(
    (newTags: string[]) => {
      setIsHashtagAddOpen(false);
      const newHashtags = hashtags ? [...hashtags, ...newTags] : [...newTags];
      onChange(newHashtags);
    },
    [hashtags, onChange]
  );

  const handleAcceptRemovedHashtags = useCallback(
    (newTags: string[]) => {
      setIsHashtagRemoveOpen(false);
      onChange(newTags.length ? newTags : undefined);
    },
    [onChange]
  );

  const { error, errorCode, errorDetails, response } = useHashtagSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { result } = response || {};
  const { rows: allHashtags } = result || {};
  const currentHashtagRows = useMemo(() => {
    const currentRows: Row_Hashtag[] = [];
    hashtags &&
      hashtags.forEach((tag) => {
        const row = allHashtags?.find((r) => r.tag_id === tag);
        row && currentRows.push(row);
      });
    return currentRows;
  }, [allHashtags, hashtags]);
  const notSelectedHashtagRows = useMemo(() => {
    const notSelectedRows: Row_Hashtag[] = [];
    allHashtags &&
      allHashtags.forEach((row) => {
        !hashtags?.includes(row.tag_id) && notSelectedRows.push(row);
      });
    return notSelectedRows;
  }, [allHashtags, hashtags]);

  return (
    <>
      <ErrorDisplay
        error={error}
        errorCode={errorCode}
        errorDetails={errorDetails}
      />
      {editorWarning && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={true}
          autoHideDuration={6000}
          onClose={() => setEditorWarning(undefined)}
        >
          <Alert severity="warning">{editorWarning}</Alert>
        </Snackbar>
      )}
      {isHashtagAddOpen && allHashtags && (
        <HashtagMultiselectionDialog
          visibleHashtags={notSelectedHashtagRows}
          handleAccept={(tagIds) => handleAcceptNewHashtags(tagIds)}
          handleCancel={() => setIsHashtagAddOpen(false)}
        />
      )}
      {isHashtagRemoveOpen && hashtags && currentHashtagRows && (
        <HashtagMultiselectionDialog
          initialSelection={hashtags}
          visibleHashtags={currentHashtagRows}
          handleAccept={(tagIds) => handleAcceptRemovedHashtags(tagIds)}
          handleCancel={() => setIsHashtagRemoveOpen(false)}
        />
      )}
      <TextField
        margin="dense"
        id="hashtags"
        label="Hashtags"
        value={hashtags ? hashtags.join(", ") : ""}
        type="text"
        fullWidth
        variant="standard"
        InputProps={{
          endAdornment: (
            <>
              <IconButton
                disabled={!hashtags}
                onClick={() => setIsHashtagRemoveOpen(true)}
              >
                <RemoveIcon />
              </IconButton>
              <IconButton
                disabled={notSelectedHashtagRows.length < 1}
                onClick={() => setIsHashtagAddOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </>
          ),
        }}
      />
    </>
  );
};

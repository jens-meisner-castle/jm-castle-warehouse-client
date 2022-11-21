import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Alert, IconButton, MenuItem, Snackbar } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { CountUnits, isCountUnit } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpeechInput } from "../../../speech/useSpeechInput";
import { ArticleRow } from "../../../types/RowTypes";

export interface EditArticleDialogProps {
  article: ArticleRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (article: ArticleRow) => void;
}

const neverUpdate = () => console.log("never");

export const EditArticleDialog = (props: EditArticleDialogProps) => {
  const { article, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState(article);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>();
  const [imageFilePath, setImageFilePath] = useState("");
  const updateData = (updates: Partial<ArticleRow>) => {
    setData((previous) => ({ ...previous, ...updates }));
  };
  const countUnits = useMemo(
    () =>
      Object.keys(CountUnits).map((k) => ({ id: k, name: CountUnits[k].name })),
    []
  );
  const imageFile =
    imageInputRef.current && imageInputRef.current.files
      ? imageInputRef.current.files[0]
      : undefined;
  const imageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : undefined),
    [imageFile]
  );
  const [speechInput, setSpeechInput] = useState<{
    topic: string;
    updateIndicator: number;
  }>({ topic: "none", updateIndicator: 0 });

  const {
    text: spokenInput,
    error: speechInputError,
    recognitionInProgress,
    cancel: cancelSpeechInput,
  } = useSpeechInput(speechInput.topic, speechInput.updateIndicator);

  useEffect(() => {
    if (!spokenInput) {
      return;
    }
    switch (speechInput.topic) {
      case "name":
        updateData({ name: spokenInput });
        break;
    }
  }, [spokenInput, speechInput]);

  const startSpeechInput = useCallback((topic: "name") => {
    setSpeechInput((previous) => ({
      topic,
      updateIndicator: previous.updateIndicator + 1,
    }));
  }, []);

  return (
    <>
      {speechInputError && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setIsAnySnackbarOpen(false)}
        >
          <Alert severity="error">{`Fehler bei der Spracheingabe: ${speechInputError}`}</Alert>
        </Snackbar>
      )}
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Artikel bearbeiten</DialogTitle>
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
            value={data.articleId}
            onChange={() => neverUpdate()}
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            value={data.name}
            onChange={(event) => updateData({ name: event.target.value })}
            type="text"
            fullWidth
            variant="standard"
            InputProps={{
              endAdornment:
                recognitionInProgress && speechInput.topic === "name" ? (
                  <IconButton
                    onClick={() => cancelSpeechInput && cancelSpeechInput()}
                  >
                    <MicOffIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    disabled={recognitionInProgress}
                    onClick={() => startSpeechInput("name")}
                  >
                    <MicIcon />
                  </IconButton>
                ),
            }}
            helperText={
              recognitionInProgress && speechInput.topic === "name"
                ? "Bitte sprechen Sie jetzt."
                : ""
            }
          />
          <TextField
            margin="dense"
            id="countUnit"
            select
            label="Zähleinheit"
            value={data.countUnit}
            onChange={(event) => {
              isCountUnit(event.target.value) &&
                updateData({ countUnit: event.target.value });
            }}
            helperText="Bitte wählen Sie eine Zähleinheit aus"
            variant="standard"
          >
            {countUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {`${unit.id} (${unit.name})`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            inputRef={imageInputRef}
            margin="dense"
            id="articleImage"
            label="Artikelbild"
            value={imageFilePath}
            onChange={(event) => setImageFilePath(event.target.value)}
            type="file"
            fullWidth
            variant="standard"
          />
          <TextField
            id="articleImageDisplay"
            margin="normal"
            variant="standard"
            fullWidth
            InputProps={{
              startAdornment: (
                <img
                  src={imageUrl}
                  alt={imageFilePath}
                  style={{ width: "30vw" }}
                />
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAccept(data)}>Speichern</Button>
          <Button onClick={handleCancel}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

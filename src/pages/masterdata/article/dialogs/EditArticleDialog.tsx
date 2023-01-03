import HideImageIcon from "@mui/icons-material/HideImage";
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import {
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Snackbar,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { CountUnits, isCountUnit } from "jm-castle-warehouse-types/build";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  backendApiUrl,
  getImageDisplayUrl,
} from "../../../../configuration/Urls";

import { useSpeechInput } from "../../../../speech/useSpeechInput";
import { ArticleRow } from "../../../../types/RowTypes";
import { getExtension } from "../../../../utils/File";
import { ArticleEditState } from "../Types";

export interface EditArticleDialogProps {
  article: ArticleRow;
  open: boolean;
  handleCancel: () => void;
  handleAccept: (data: ArticleEditState) => void;
}

const neverUpdate = () => console.error("never");

export const EditArticleDialog = (props: EditArticleDialogProps) => {
  const { article, handleAccept, handleCancel, open } = props;
  const [data, setData] = useState<ArticleEditState>({
    row: article,
  });
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>();
  const [imageFilePath, setImageFilePath] = useState<string | undefined>(
    undefined
  );
  const imageFile =
    imageFilePath && imageInputRef.current && imageInputRef.current.files
      ? imageInputRef.current.files[0]
      : undefined;

  useEffect(() => {
    const newImage =
      imageFile && imageFilePath
        ? { extension: getExtension(imageFilePath), file: imageFile }
        : null;
    setData((previous) => ({
      deleteImageReference: previous.deleteImageReference,
      row: {
        ...previous.row,
        articleImgRef:
          previous.row.articleImgRef ||
          (newImage
            ? `${previous.row.articleId}.${newImage.extension}`
            : undefined),
      },
      newImage,
    }));
  }, [imageFile, imageFilePath]);

  const updateDataRow = (updates: Partial<ArticleRow>) => {
    setData((previous) => ({
      ...previous,
      row: { ...previous.row, ...updates },
    }));
  };
  const resetSelectedImage = useCallback(() => {
    if (imageFilePath) {
      setImageFilePath(undefined);
      return;
    }
    updateDataRow({ articleImgRef: undefined });
  }, [imageFilePath]);
  const countUnits = useMemo(
    () =>
      Object.keys(CountUnits).map((k) => ({
        id: k,
        name: CountUnits[k as keyof typeof CountUnits].name,
      })),
    []
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
        updateDataRow({ name: spokenInput });
        break;
    }
  }, [spokenInput, speechInput]);

  const startSpeechInput = useCallback((topic: "name") => {
    setSpeechInput((previous) => ({
      topic,
      updateIndicator: previous.updateIndicator + 1,
    }));
  }, []);

  const clickOnInvisibleImageInput = useCallback(() => {
    imageInputRef.current && imageInputRef.current.click();
  }, [imageInputRef]);
  const { articleId, name, countUnit, articleImgRef } = data.row;
  const { deleteImageReference } = data;
  const imageUrl = useMemo(
    () =>
      imageFile
        ? URL.createObjectURL(imageFile)
        : getImageDisplayUrl(backendApiUrl, articleImgRef),
    [imageFile, articleImgRef]
  );

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
            value={articleId}
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
            value={name}
            onChange={(event) => updateDataRow({ name: event.target.value })}
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
            value={countUnit}
            onChange={(event) => {
              isCountUnit(event.target.value) &&
                updateDataRow({ countUnit: event.target.value });
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
            margin="dense"
            id="articleImageRef"
            label="Artikelbild Referenz"
            value={articleImgRef || ""}
            onChange={(event) =>
              updateDataRow({ articleImgRef: event.target.value })
            }
            type="text"
            fullWidth
            variant="standard"
          />
          {article.articleImgRef && (
            <FormControlLabel
              value="deleteImageReference"
              control={
                <Checkbox
                  value={deleteImageReference || false}
                  onChange={(event, checked) => {
                    setData((previous) => ({
                      ...previous,
                      deleteImageReference: checked,
                    }));
                  }}
                />
              }
              label={`Artikelbild <${article.articleImgRef}> löschen`}
              labelPlacement="start"
            />
          )}
          <TextField
            autoFocus
            margin="dense"
            id="articleImage"
            label="Artikelbild"
            disabled
            value={imageFilePath || ""}
            onChange={(event) => updateDataRow({ name: event.target.value })}
            type="text"
            fullWidth
            variant="standard"
            InputProps={{
              endAdornment: (
                <>
                  <IconButton onClick={clickOnInvisibleImageInput}>
                    <ImageIcon />
                  </IconButton>
                  {imageUrl && (
                    <IconButton onClick={resetSelectedImage}>
                      <HideImageIcon />
                    </IconButton>
                  )}
                </>
              ),
            }}
          />
          <TextField
            inputRef={imageInputRef}
            style={{ display: "none" }}
            margin="dense"
            id="articleImageInput"
            label="Artikelbild"
            value={imageFilePath || ""}
            onChange={(event) => setImageFilePath(event.target.value)}
            type="file"
            inputProps={{ accept: "image/*" }}
            fullWidth
            variant="standard"
          />
          <TextField
            id="articleImageDisplay"
            margin="normal"
            variant="standard"
            disabled
            fullWidth
            InputProps={{
              startAdornment: imageUrl && (
                <img
                  src={imageUrl}
                  alt={imageFilePath || articleImgRef}
                  style={{ maxWidth: "30vw" }}
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

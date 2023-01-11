import FirstPageIcon from "@mui/icons-material/FirstPage";
import HideImageIcon from "@mui/icons-material/HideImage";
import ImageIcon from "@mui/icons-material/Image";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Alert,
  Grid,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { ImageSelectionDialog } from "./ImageSelectionDialog";
import { ImagesSlide } from "./ImagesSlide";

export interface ImageRefsEditorProps {
  imageRefs: string[] | undefined;
  onChange: (imageRefs: string[] | undefined) => void;
}

export const ImageRefsEditor = (props: ImageRefsEditorProps) => {
  const { imageRefs, onChange } = props;
  const [editorWarning, setEditorWarning] = useState<string | undefined>(
    undefined
  );
  const [imageIndex, setImageIndex] = useState(-1);
  const [isImageSelectionOpen, setIsImageSelectionOpen] = useState(false);

  useEffect(() => {
    const maxIndex = imageRefs ? imageRefs.length - 1 : -1;
    if (imageIndex > maxIndex) {
      setImageIndex(maxIndex);
    }
    if (imageIndex < 0 && imageRefs?.length) {
      setImageIndex(0);
    }
  }, [imageRefs, imageIndex]);

  const handleAcceptNewImage = useCallback(
    (imageId: string) => {
      setIsImageSelectionOpen(false);
      if (!imageRefs?.includes(imageId)) {
        const newImageRefs = imageRefs
          ? [
              ...imageRefs.slice(0, imageIndex),
              imageId,
              ...imageRefs.slice(imageIndex),
            ]
          : [imageId];
        onChange(newImageRefs);
      } else {
        setEditorWarning(
          `Das ausgewählte Bild <${imageId}> wurde bereits zugeordnet. Eine doppelte Zuordnung wird verhindert.`
        );
      }
    },
    [imageRefs, imageIndex, onChange]
  );
  const removeImageAtIndex = useCallback(
    (index: number) => {
      const newImageRefs =
        imageRefs && imageRefs.length > 1
          ? [...imageRefs.slice(0, index), ...imageRefs.slice(index + 1)]
          : undefined;

      onChange(newImageRefs);
    },
    [imageRefs, onChange]
  );
  const moveImageToTop = useCallback(
    (index: number) => {
      if (!imageRefs) {
        return;
      }
      if (index === 0) {
        return;
      }
      const newImageRefs =
        imageRefs && imageRefs.length > 1
          ? [
              imageRefs[index],
              ...imageRefs.slice(0, index),
              ...imageRefs.slice(index + 1),
            ]
          : imageRefs;
      onChange(newImageRefs);
      setImageIndex(0);
    },
    [imageRefs, onChange]
  );
  const moveImageToBottom = useCallback(
    (index: number) => {
      if (!imageRefs) {
        return;
      }
      if (index === imageRefs.length) {
        return;
      }
      const newImageRefs =
        imageRefs && imageRefs.length > 1
          ? [
              ...imageRefs.slice(0, index),
              ...imageRefs.slice(index + 1),
              imageRefs[index],
            ]
          : imageRefs;
      onChange(newImageRefs);
      setImageIndex(imageRefs.length - 1);
    },
    [imageRefs, onChange]
  );
  const moveImageBackward = useCallback(
    (index: number) => {
      if (!imageRefs) {
        return;
      }
      if (index === imageRefs.length - 1) {
        return;
      }
      const newImageRefs =
        imageRefs && imageRefs.length > 1
          ? [
              ...imageRefs.slice(0, index),
              imageRefs[index + 1],
              imageRefs[index],
              ...imageRefs.slice(Math.min(index + 2, imageRefs.length)),
            ]
          : imageRefs;
      onChange(newImageRefs);
      setImageIndex(index + 1);
    },
    [imageRefs, onChange]
  );
  const moveImageForward = useCallback(
    (index: number) => {
      if (!imageRefs) {
        return;
      }
      if (index === 0) {
        return;
      }
      const newImageRefs =
        imageRefs && imageRefs.length > 1
          ? [
              ...imageRefs.slice(0, Math.max(index - 1)),
              imageRefs[index],
              imageRefs[index - 1],
              ...imageRefs.slice(index + 1),
            ]
          : imageRefs;
      onChange(newImageRefs);
      setImageIndex(index - 1);
    },
    [imageRefs, onChange]
  );

  const imageFieldValue = imageRefs?.length
    ? `Bild ${imageIndex + 1} entfernen oder neues Bild zuordnen.`
    : "Bild zuordnen";

  return (
    <>
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
      {isImageSelectionOpen && (
        <ImageSelectionDialog
          hiddenImageIds={imageRefs}
          handleAccept={handleAcceptNewImage}
          handleCancel={() => setIsImageSelectionOpen(false)}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <ImagesSlide
            imageRefs={imageRefs}
            maxSize="30vw"
            index={imageIndex}
            onIndexChange={setImageIndex}
          />
        </Grid>
        {imageRefs && (
          <Grid item>
            <Grid container direction="row" alignItems="center">
              <Grid item>
                <Typography>{"Verschieben:"}</Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Bild an den Anfang schieben.">
                  <span>
                    <IconButton
                      disabled={imageIndex < 1}
                      onClick={() => moveImageToTop(imageIndex)}
                    >
                      <FirstPageIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Bild eine Position nach vorne schieben.">
                  <span>
                    <IconButton
                      disabled={imageIndex < 1}
                      onClick={() => moveImageForward(imageIndex)}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Bild eine Position nach hinten schieben.">
                  <span>
                    <IconButton
                      disabled={
                        !imageRefs || imageIndex >= imageRefs.length - 1
                      }
                      onClick={() => moveImageBackward(imageIndex)}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Bild an das Ende schieben.">
                  <span>
                    <IconButton
                      disabled={
                        !imageRefs || imageIndex >= imageRefs.length - 1
                      }
                      onClick={() => moveImageToBottom(imageIndex)}
                    >
                      <LastPageIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
      <TextField
        margin="dense"
        id="image"
        label="Bild"
        disabled
        value={imageFieldValue}
        type="text"
        fullWidth
        variant="standard"
        InputProps={{
          endAdornment: (
            <>
              {imageIndex > -1 && (
                <IconButton onClick={() => removeImageAtIndex(imageIndex)}>
                  <HideImageIcon />
                </IconButton>
              )}
              <IconButton onClick={() => setIsImageSelectionOpen(true)}>
                <ImageIcon />
              </IconButton>
            </>
          ),
        }}
      />
    </>
  );
};

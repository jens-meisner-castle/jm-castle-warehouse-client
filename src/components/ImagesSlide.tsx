import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../configuration/Urls";

export interface ImagesSlideProps {
  imageRefs: string[] | undefined;
  maxSize: string | number;
  index?: number;
  onIndexChange?: (index: number) => void;
}

export const ImagesSlide = (props: ImagesSlideProps) => {
  const { imageRefs, maxSize, onIndexChange, index: controlledIndex } = props;
  const [stateIndex, setStateIndex] = useState(0);

  const isControlled = typeof controlledIndex === "number";

  useEffect(() => {
    const newIndex = imageRefs ? 0 : -1;
    !isControlled && setStateIndex(newIndex);
  }, [imageRefs, isControlled]);

  const index = isControlled ? controlledIndex : stateIndex;

  const currentImageRef = imageRefs ? imageRefs[index] : undefined;
  const currentImgSrc = getImageDisplayUrl(backendApiUrl, currentImageRef);
  const nextImage = useCallback(() => {
    if (!imageRefs) {
      return;
    }
    if (imageRefs.length < 2) {
      return;
    }
    !isControlled &&
      setStateIndex((previous) => {
        return imageRefs.length > previous + 1 ? previous + 1 : 0;
      });
    isControlled &&
      onIndexChange &&
      onIndexChange(
        imageRefs.length > controlledIndex + 1 ? controlledIndex + 1 : 0
      );
  }, [imageRefs, isControlled, controlledIndex, onIndexChange]);
  const prevImage = useCallback(() => {
    if (!imageRefs) {
      return;
    }
    if (imageRefs.length < 2) {
      return;
    }
    !isControlled &&
      setStateIndex((previous) => {
        return previous === 0 ? imageRefs.length - 1 : previous - 1;
      });
    isControlled &&
      onIndexChange &&
      onIndexChange(
        controlledIndex === 0 ? imageRefs.length - 1 : controlledIndex - 1
      );
  }, [imageRefs, isControlled, controlledIndex, onIndexChange]);

  useEffect(() => {
    !isControlled && onIndexChange && onIndexChange(index);
  }, [index, onIndexChange, isControlled]);

  return (
    <Grid container direction="column">
      <Grid item>
        <img
          onClick={nextImage}
          src={currentImgSrc}
          alt={currentImageRef}
          style={{ maxWidth: maxSize, maxHeight: maxSize }}
        />
      </Grid>
      {imageRefs?.length ? (
        <Grid item>
          <Grid container direction="row" alignItems="center">
            <Grid item>
              <Typography>{index + 1}</Typography>
            </Grid>
            <Grid item>
              <Typography style={{ marginLeft: 5 }}>{" von "}</Typography>
            </Grid>
            <Grid item>
              <Typography style={{ marginLeft: 5 }}>
                {imageRefs.length}
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Vorheriges Bild.">
                <span>
                  <IconButton disabled={index < 1} onClick={prevImage}>
                    <NavigateBeforeIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Nächstes Bild.">
                <span>
                  <IconButton
                    disabled={index >= imageRefs.length - 1}
                    onClick={nextImage}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
            <Grid item>
              <Typography style={{ marginLeft: 10 }} component="span">
                {`(Bild ID: ${currentImageRef})`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid item>
          <Typography component="span">{"Keine Bilder zugeordnet."}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

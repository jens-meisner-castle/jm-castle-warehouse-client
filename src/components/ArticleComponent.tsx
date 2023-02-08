import MoveDownIcon from "@mui/icons-material/MoveDown";
import { Button, Grid, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";
import { WwwLink } from "../navigation/WwwLink";
import { ArticleRow } from "../types/RowTypes";
import { ImagesSlide } from "./ImagesSlide";
import {
  buttonSizeForSize,
  SizeVariant,
  typoVariantForSize,
} from "./SizeVariant";

export interface ArticleComponentProps {
  article: ArticleRow;
  sizeVariant: SizeVariant;
  onMove?: (article: ArticleRow) => void;
  onMoveHelp?: string;
}

export const ArticleComponent = (props: ArticleComponentProps) => {
  const { article, sizeVariant, onMove, onMoveHelp } = props;
  const { articleId, imageRefs, name, wwwLink } = article;
  const typoVariant = typoVariantForSize(sizeVariant);
  const buttonSize = buttonSizeForSize(sizeVariant);
  const wwwLinkUrl = useMemo(
    () => (wwwLink ? new URL(wwwLink) : undefined),
    [wwwLink]
  );

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant={typoVariant} align="center">
          {articleId}
        </Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item>
            {imageRefs && (
              <>
                <Grid item>
                  <ImagesSlide
                    imageRefs={imageRefs}
                    sizeVariant={sizeVariant}
                  />
                </Grid>
                {wwwLink && wwwLinkUrl && (
                  <Grid item>
                    <WwwLink
                      to={wwwLink}
                      label={wwwLinkUrl.host}
                      variant={typoVariant}
                    />
                  </Grid>
                )}
              </>
            )}
            {!imageRefs && (
              <>
                <Grid item>
                  <Typography variant={typoVariant}>{name}</Typography>
                </Grid>
                {wwwLink && wwwLinkUrl && (
                  <Grid item>
                    <WwwLink
                      to={wwwLink}
                      label={wwwLinkUrl.host}
                      variant={typoVariant}
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
          {onMove && (
            <Grid item>
              {onMoveHelp ? (
                <Tooltip title={onMoveHelp}>
                  <Button
                    size={buttonSize}
                    variant="contained"
                    onClick={() => onMove(article)}
                  >
                    <MoveDownIcon />
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  size={buttonSize}
                  variant="contained"
                  onClick={() => onMove(article)}
                >
                  <MoveDownIcon />
                </Button>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

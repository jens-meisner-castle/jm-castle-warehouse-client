import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { WwwLink } from "../navigation/WwwLink";
import { ArticleRow } from "../types/RowTypes";
import { EmitButton } from "./buttons/EmitButton";
import { MoveButton } from "./buttons/MoveButton";
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
  onEmit?: (article: ArticleRow) => void;
  onEmitHelp?: string;
}

export const ArticleComponent = (props: ArticleComponentProps) => {
  const { article, sizeVariant, onMove, onMoveHelp, onEmit, onEmitHelp } =
    props;
  const { articleId, imageRefs, wwwLink } = article;
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
          <Grid item>
            <Grid container direction="column">
              {onMove && (
                <Grid item>
                  <MoveButton
                    size={buttonSize}
                    onClick={() => onMove(article)}
                    tooltip={onMoveHelp}
                  />
                </Grid>
              )}
              {onEmit && (
                <Grid item>
                  <EmitButton
                    size={buttonSize}
                    onClick={() => onEmit(article)}
                    tooltip={onEmitHelp}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

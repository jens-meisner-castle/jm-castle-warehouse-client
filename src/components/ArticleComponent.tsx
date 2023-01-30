import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { WwwLink } from "../navigation/WwwLink";
import { ArticleRow } from "../types/RowTypes";
import { ImagesSlide } from "./ImagesSlide";

export interface ArticleComponentProps {
  article: ArticleRow;
}

export const ArticleComponent = (props: ArticleComponentProps) => {
  const { article } = props;
  const { articleId, imageRefs, name, wwwLink } = article;
  const wwwLinkUrl = useMemo(
    () => (wwwLink ? new URL(wwwLink) : undefined),
    [wwwLink]
  );

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography align="center">{articleId}</Typography>
      </Grid>
      {imageRefs && (
        <>
          <Grid item>
            <ImagesSlide imageRefs={imageRefs} maxSize={250} />
          </Grid>
          {wwwLink && wwwLinkUrl && (
            <Grid item>
              <WwwLink to={wwwLink} label={wwwLinkUrl.host} variant="body2" />
            </Grid>
          )}
        </>
      )}
      {!imageRefs && (
        <>
          <Grid item>
            <Typography>{name}</Typography>
          </Grid>
          {wwwLink && wwwLinkUrl && (
            <Grid item>
              <WwwLink to={wwwLink} label={wwwLinkUrl.host} variant="body2" />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

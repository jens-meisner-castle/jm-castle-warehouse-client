import { Grid, Typography } from "@mui/material";
import {
  SectionStockState,
  StockStateCounts,
} from "jm-castle-warehouse-types/build";
import { useCallback, useMemo } from "react";
import {
  ArticleRow,
  fromRawArticle,
  fromRawStoreSection,
  StoreSectionRow,
} from "../types/RowTypes";
import { ArticleComponent } from "./ArticleComponent";
import { SizeVariant, typoVariantForSize } from "./SizeVariant";
import { StoreSectionComponent } from "./StoreSectionComponent";

export interface SectionStockStateComponentProps {
  stockState: SectionStockState;
  sizeVariant: SizeVariant;
  onAddToSection?: (section: StoreSectionRow) => void;
  onAddToSectionHelp?: string;
  onMoveArticle?: (article: ArticleRow, section: StoreSectionRow) => void;
  onMoveArticleHelp?: string;
}

export const SectionStockStateComponent = (
  props: SectionStockStateComponentProps
) => {
  const {
    stockState,
    onAddToSection,
    onAddToSectionHelp,
    sizeVariant,
    onMoveArticle,
    onMoveArticleHelp,
  } = props;
  const { section, states } = stockState;

  const typoVariant = typoVariantForSize(sizeVariant);

  const sectionRow = useMemo(() => fromRawStoreSection(section), [section]);

  const articlesWithCount = useMemo(() => {
    const newData: ({ article: ArticleRow } & StockStateCounts)[] = [];
    states.forEach(
      (d) =>
        (d.physicalCount || d.availableCount) &&
        newData.push({
          article: fromRawArticle(d.article),
          physicalCount: d.physicalCount,
          availableCount: d.availableCount,
        })
    );
    return newData;
  }, [states]);

  const handleMoveArticle = useCallback(
    (article: ArticleRow) =>
      onMoveArticle && onMoveArticle(article, sectionRow),
    [sectionRow, onMoveArticle]
  );

  return (
    <Grid container direction="row">
      <Grid item>
        <div style={{ paddingRight: 5 }}>
          <StoreSectionComponent
            section={sectionRow}
            sizeVariant={sizeVariant}
            onAdd={onAddToSection}
            onAddHelp={onAddToSectionHelp}
          />
        </div>
      </Grid>
      {articlesWithCount.length ? (
        articlesWithCount.map((d, i) => (
          <Grid key={d.article.articleId} item>
            <div
              style={{
                paddingRight: articlesWithCount.length - 1 === i ? 0 : 5,
              }}
            >
              <ArticleComponent
                article={d.article}
                sizeVariant={sizeVariant}
                onMove={onMoveArticle ? handleMoveArticle : undefined}
                onMoveHelp={onMoveArticleHelp}
              />
              <Typography
                variant={typoVariant}
              >{`Lagermenge: ${d.physicalCount}, verfügbar: ${d.availableCount}`}</Typography>
            </div>
          </Grid>
        ))
      ) : (
        <Grid item>
          <div>
            <Typography variant={typoVariant}>{`Lager ist leer.`}</Typography>
          </div>
        </Grid>
      )}
    </Grid>
  );
};

import { Grid, Typography } from "@mui/material";
import {
  SectionStockState,
  StockStateCounts,
} from "jm-castle-warehouse-types/build";
import { CSSProperties, useCallback, useMemo } from "react";
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
  onEmitArticle?: (article: ArticleRow, section: StoreSectionRow) => void;
  onEmitArticleHelp?: string;
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
    onEmitArticle,
    onEmitArticleHelp,
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

  const handleEmitArticle = useCallback(
    (article: ArticleRow) =>
      onEmitArticle && onEmitArticle(article, sectionRow),
    [sectionRow, onEmitArticle]
  );

  const gridCellStyle: CSSProperties = useMemo(() => ({ maxWidth: "50%" }), []);

  return (
    <Grid container direction="row">
      <Grid style={gridCellStyle} item>
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
        articlesWithCount.map((d) => (
          <Grid style={gridCellStyle} key={d.article.articleId} item>
            <div
              style={{
                width: "100%",
                height: "100%",
                padding: 5,
              }}
            >
              <div
                style={{
                  borderStyle: "solid",
                  borderColor: "white",
                  borderWidth: 1,
                  padding: 5,
                  width: "calc(100% - 20px)",
                  height: "calc(100% - 20px)",
                }}
              >
                <ArticleComponent
                  article={d.article}
                  sizeVariant={sizeVariant}
                  onMove={onMoveArticle ? handleMoveArticle : undefined}
                  onMoveHelp={onMoveArticleHelp}
                  onEmit={onEmitArticle ? handleEmitArticle : undefined}
                  onEmitHelp={onEmitArticleHelp}
                />
                <Typography
                  sx={{
                    color:
                      d.physicalCount < 0 || d.availableCount < 0
                        ? "error.main"
                        : undefined,
                  }}
                  variant={typoVariant}
                >{`Lager: ${d.physicalCount}, verfügbar: ${d.availableCount}`}</Typography>
              </div>
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

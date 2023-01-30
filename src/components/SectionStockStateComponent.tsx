import { Grid, Typography } from "@mui/material";
import {
  SectionStockState,
  StockStateCounts,
} from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import {
  ArticleRow,
  fromRawArticle,
  fromRawStoreSection,
  StoreSectionRow,
} from "../types/RowTypes";
import { ArticleComponent } from "./ArticleComponent";
import { StoreSectionComponent } from "./StoreSectionComponent";

export interface SectionStockStateComponentProps {
  stockState: SectionStockState;
  onAddToSection?: (section: StoreSectionRow) => void;
}

export const SectionStockStateComponent = (
  props: SectionStockStateComponentProps
) => {
  const { stockState, onAddToSection } = props;
  const { section, states } = stockState;

  const sectionRow = useMemo(() => fromRawStoreSection(section), [section]);

  const articlesWithCount = useMemo(() => {
    const newData: ({ article: ArticleRow } & StockStateCounts)[] = [];
    states.forEach((d) =>
      newData.push({
        article: fromRawArticle(d.article),
        physicalCount: d.physicalCount,
        availableCount: d.availableCount,
      })
    );
    return newData;
  }, [states]);

  return (
    <Grid container direction="row">
      <Grid item>
        <div style={{ paddingRight: 5 }}>
          <StoreSectionComponent section={sectionRow} onAdd={onAddToSection} />
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
              <ArticleComponent article={d.article} />
              <Typography>{`Lagermenge: ${d.physicalCount}, verfügbar: ${d.availableCount}`}</Typography>
            </div>
          </Grid>
        ))
      ) : (
        <Grid item>
          <div>
            <Typography>{`Lager ist leer.`}</Typography>
          </div>
        </Grid>
      )}
    </Grid>
  );
};

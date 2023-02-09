import { Grid, Typography } from "@mui/material";
import { ErrorCode, StockStateCounts } from "jm-castle-warehouse-types/build";
import { useEffect, useMemo } from "react";
import { AppAction } from "../../../components/AppActions";
import { ArticleComponent } from "../../../components/ArticleComponent";
import { StoreSectionRefAutocomplete } from "../../../components/autocomplete/StoreSectionRefAutocomplete";
import { ErrorData } from "../../../components/ErrorDisplays";
import {
  SizeVariant,
  typoVariantForSize,
} from "../../../components/SizeVariant";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useStockSectionSelect } from "../../../hooks/useStockSectionSelect";
import {
  ArticleRow,
  fromRawArticle,
  StoreSectionRow,
} from "../../../types/RowTypes";

export interface FindStockStateTargetProps {
  availableSections: StoreSectionRow[];
  section?: StoreSectionRow;
  onChangeSection: (section: StoreSectionRow | null) => void;
  sizeVariant: SizeVariant;
  description: string;
  actions: AppAction[];
  onError: (errorData: Record<string, ErrorData>) => void;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const FindStockStateTarget = (props: FindStockStateTargetProps) => {
  const {
    availableSections,
    section,
    onChangeSection,
    description,
    actions,
    onError,
    handleExpiredToken,
    sizeVariant,
  } = props;

  const typoVariant = typoVariantForSize(sizeVariant);

  const stockApiResponse = useStockSectionSelect(
    backendApiUrl,
    section?.sectionId,
    1,
    handleExpiredToken
  );
  const { response: sectionStock } = stockApiResponse;

  const { states } = sectionStock || {};

  const articlesWithCount = useMemo(() => {
    const newData: ({ article: ArticleRow } & StockStateCounts)[] = [];
    states?.forEach(
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

  useEffect(() => {
    if (stockApiResponse.error) {
      onError({ stock: stockApiResponse });
    }
  }, [stockApiResponse, onError]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <StoreSectionRefAutocomplete
          sections={availableSections}
          value={section}
          onChange={onChangeSection}
        />
        <Grid container direction="row">
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
                <Typography variant={typoVariant}>
                  {section ? `Lager ist leer.` : ""}
                </Typography>
              </div>
            </Grid>
          )}
        </Grid>
      </div>
    </ViewFrame>
  );
};

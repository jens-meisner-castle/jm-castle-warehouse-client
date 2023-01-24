import { Grid, Typography } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useMemo } from "react";
import { AppAction } from "../../../components/AppActions";
import { ErrorData } from "../../../components/ErrorDisplays";
import { SizeVariant } from "../../../components/SizeVariant";
import { StockArticlesTable } from "../../../components/table/StockArticlesTable";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useStockArticleSelect } from "../../../hooks/useStockArticleSelect";
import {
  ArticleRow,
  stockArticleExtRowsFromStockState,
} from "../../../types/RowTypes";

export interface CompareArticleStockProps {
  article: ArticleRow | undefined;
  sizeVariant: SizeVariant;
  description: string;
  actions: AppAction[];
  onError: (errorData: Record<string, ErrorData>) => void;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const CompareArticleStock = (props: CompareArticleStockProps) => {
  const {
    article,
    sizeVariant,
    description,
    actions,
    onError,
    handleExpiredToken,
  } = props;

  const { articleId } = article || {};

  const stockApiResponse = useStockArticleSelect(
    backendApiUrl,
    articleId,
    1,
    handleExpiredToken
  );
  const { response: stockState } = stockApiResponse;

  const rows = useMemo(
    () =>
      stockState &&
      stockArticleExtRowsFromStockState({
        [stockState.article.article_id]: stockState,
      }),
    [stockState]
  );

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {
      stock: stockApiResponse,
    };
    return newData;
  }, [stockApiResponse]);

  useEffect(() => {
    Object.keys(errorData).length && onError(errorData);
  }, [errorData, onError]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <Grid container direction="column">
          <Grid item>
            <Typography>{`Artikel: ${articleId || "?"}`}</Typography>
          </Grid>
          <Grid item>
            <StockArticlesTable data={rows || []} sizeVariant={sizeVariant} />
          </Grid>
        </Grid>
      </div>
    </ViewFrame>
  );
};

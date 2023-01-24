import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useMemo } from "react";
import { AppAction } from "../../../components/AppActions";
import { ArticleRefAutocomplete } from "../../../components/autocomplete/ArticleRefAutocomplete";
import { ErrorData } from "../../../components/ErrorDisplays";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useArticleSelect } from "../../../hooks/useArticleSelect";
import { ArticleRow, fromRawArticle } from "../../../types/RowTypes";

export interface FindArticleProps {
  article?: ArticleRow;
  onChangeArticle: (article: ArticleRow | null) => void;
  description: string;
  actions: AppAction[];
  onError: (errorData: Record<string, ErrorData>) => void;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const FindArticle = (props: FindArticleProps) => {
  const {
    article,
    onChangeArticle,
    description,
    actions,
    onError,
    handleExpiredToken,
  } = props;

  const articlesApiResponse = useArticleSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response } = articlesApiResponse;
  const { result } = response || {};
  const { rows } = result || {};
  const articles = useMemo(() => rows?.map((r) => fromRawArticle(r)), [rows]);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {
      article: articlesApiResponse,
    };
    return newData;
  }, [articlesApiResponse]);

  useEffect(() => {
    Object.keys(errorData).length && onError(errorData);
  }, [errorData, onError]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <ArticleRefAutocomplete
          articles={articles || []}
          value={article}
          onChange={onChangeArticle}
        />
      </div>
    </ViewFrame>
  );
};

import { useCallback, useMemo } from "react";
import { ArticleRow } from "../../types/RowTypes";
import { ArticleRefAutocomplete } from "../autocomplete/ArticleRefAutocomplete";

export interface FindArticleInMasterdataProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  articles: ArticleRow[];
}

export const FindArticleInMasterdata = (
  props: FindArticleInMasterdataProps
) => {
  const { value, onChange, articles } = props;

  const currentArticle = useMemo(
    () => articles.find((r) => r.articleId === value),
    [articles, value]
  );

  const handleChangedCurrentArticle = useCallback(
    (row: ArticleRow | null) => {
      onChange(row?.articleId);
    },
    [onChange]
  );

  return (
    <ArticleRefAutocomplete
      articles={articles}
      value={currentArticle}
      onChange={handleChangedCurrentArticle}
    />
  );
};

import { AppAction } from "jm-castle-components/build";
import { ArticleRefAutocomplete } from "../../../components/autocomplete/ArticleRefAutocomplete";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { ArticleRow } from "../../../types/RowTypes";

export interface FindArticleProps {
  availableArticles: ArticleRow[];
  article?: ArticleRow;
  onChangeArticle: (article: ArticleRow | null) => void;
  description: string;
  actions: AppAction[];
}

export const FindArticle = (props: FindArticleProps) => {
  const { article, availableArticles, onChangeArticle, description, actions } =
    props;

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <ArticleRefAutocomplete
          articles={availableArticles}
          value={article}
          onChange={onChangeArticle}
        />
      </div>
    </ViewFrame>
  );
};

import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect } from "react";
import { AppAction } from "../../../components/AppActions";
import { ErrorData } from "../../../components/ErrorDisplays";
import { ArticleEditor } from "../../../components/row-editor/ArticleEditor";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useMasterdata } from "../../../hooks/useMasterdata";
import { ArticleRow } from "../../../types/RowTypes";

export interface CreateArticleProps {
  article: Partial<ArticleRow> | undefined;
  onChangeArticle: (article: Partial<ArticleRow>) => void;
  description: string;
  actions: AppAction[];
  onError: (errorData: Record<string, ErrorData>) => void;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const CreateArticle = (props: CreateArticleProps) => {
  const {
    article,
    onChangeArticle,
    description,
    actions,
    onError,
    handleExpiredToken,
  } = props;

  const { rows, errors: errorData } = useMasterdata(
    backendApiUrl,
    { hashtag: true, manufacturer: true, attribute: true },
    1,
    handleExpiredToken
  );

  const {
    hashtagRows: availableHashtags,
    manufacturerRows: availableManufacturers,
    attributeRows: availableAttributes,
  } = rows;
  useEffect(() => {
    Object.keys(errorData).length && onError(errorData);
  }, [errorData, onError]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <ArticleEditor
          mode="create"
          row={article || {}}
          onChange={onChangeArticle}
          availableManufacturers={availableManufacturers || []}
          availableHashtags={availableHashtags || []}
          availableAttributes={availableAttributes || []}
        />
      </div>
    </ViewFrame>
  );
};

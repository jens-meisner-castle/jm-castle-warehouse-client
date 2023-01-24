import { MenuItem, TextField } from "@mui/material";
import {
  CountUnits,
  ErrorCode,
  isCountUnit,
} from "jm-castle-warehouse-types/build";
import { useEffect, useMemo } from "react";
import { AppAction } from "../../../components/AppActions";
import { ErrorData } from "../../../components/ErrorDisplays";
import { HashtagsRefEditor } from "../../../components/multi-ref/HashtagsRefEditor";
import { ImageRefsEditor } from "../../../components/multi-ref/ImageRefsEditor";
import { TextFieldWithSpeech } from "../../../components/TextFieldWithSpeech";
import { ViewFrame } from "../../../components/usecase/ViewFrame";
import { backendApiUrl } from "../../../configuration/Urls";
import { useHashtagSelect } from "../../../hooks/useHashtagSelect";
import {
  ArticleRow,
  fromRawHashtag,
  HashtagRow,
} from "../../../types/RowTypes";

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

  const updateData = (updates: Partial<ArticleRow>) => {
    onChangeArticle({ ...article, ...updates });
  };
  const countUnits = useMemo(
    () =>
      Object.keys(CountUnits).map((k) => ({
        id: k,
        name: CountUnits[k as keyof typeof CountUnits].name,
      })),
    []
  );
  const { articleId, name, countUnit, imageRefs, hashtags, wwwLink } =
    article || {};

  const hashtagApiResponse = useHashtagSelect(
    backendApiUrl,
    "%",
    1,
    handleExpiredToken
  );
  const { response } = hashtagApiResponse;
  const { result } = response || {};
  const { rows } = result || {};

  const availableHashtags = useMemo(
    () => rows?.map((r) => fromRawHashtag(r)),
    [rows]
  );

  const currentHashtags = useMemo(() => {
    const newHashtags: HashtagRow[] = [];
    hashtags?.forEach((tagId) => {
      const hashtag = availableHashtags?.find((r) => r.tagId === tagId);
      hashtag && newHashtags.push(hashtag);
    });
    return newHashtags;
  }, [hashtags, availableHashtags]);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {
      hashtag: hashtagApiResponse,
    };
    return newData;
  }, [hashtagApiResponse]);

  useEffect(() => {
    Object.keys(errorData).length && onError(errorData);
  }, [errorData, onError]);

  return (
    <ViewFrame description={description} actions={actions}>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <TextFieldWithSpeech
          autoFocus
          margin="dense"
          id="articleId"
          label="Artikel"
          value={articleId || ""}
          onChange={(s) => updateData({ articleId: s })}
          fullWidth
          variant="standard"
        />
        <TextFieldWithSpeech
          margin="dense"
          id="name"
          label="Name"
          value={name || ""}
          onChange={(s) => {
            updateData({ name: s });
          }}
          fullWidth
          variant="standard"
        />
        <HashtagsRefEditor
          value={currentHashtags}
          hashtags={availableHashtags || []}
          onChange={(hashtags) =>
            updateData({ hashtags: hashtags?.map((r) => r.tagId) })
          }
        />
        <TextField
          margin="dense"
          id="wwwLink"
          label="Link (www)"
          value={wwwLink}
          onChange={(event) => updateData({ wwwLink: event.target.value })}
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="countUnit"
          select
          label="Zähleinheit"
          value={countUnit}
          onChange={(event) => {
            isCountUnit(event.target.value) &&
              updateData({ countUnit: event.target.value });
          }}
          helperText="Bitte wählen Sie eine Zähleinheit aus"
          fullWidth
          variant="standard"
        >
          {countUnits.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {`${unit.id} (${unit.name})`}
            </MenuItem>
          ))}
        </TextField>
        <ImageRefsEditor
          imageRefs={imageRefs}
          onChange={(imageRefs) => updateData({ imageRefs })}
        />
      </div>
    </ViewFrame>
  );
};

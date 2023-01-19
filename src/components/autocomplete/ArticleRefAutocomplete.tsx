import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { ArticleRow } from "../../types/RowTypes";

export type ArticleRefAutocompleteProps = {
  value: ArticleRow | undefined;
  onChange: (article: ArticleRow | null) => void;
  articles: ArticleRow[];
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const ArticleRefAutocomplete = (props: ArticleRefAutocompleteProps) => {
  const { articles, value, onChange, label, ...textFieldProps } = props;
  const [inputValue, setInputValue] = useState(value?.articleId);

  const orderedArticles = useMemo(() => {
    return [...articles].sort((a, b) => a.articleId.localeCompare(b.articleId));
  }, [articles]);

  return (
    <Autocomplete
      disablePortal
      id="articleRefEditor"
      getOptionLabel={(row) => row.articleId}
      options={orderedArticles}
      value={value || null}
      onChange={(event, row) => {
        onChange(row);
      }}
      inputValue={inputValue || ""}
      onInputChange={(event, value) => setInputValue(value)}
      fullWidth
      renderInput={(params) => (
        <TextField {...textFieldProps} {...params} label={label || "Artikel"} />
      )}
    />
  );
};

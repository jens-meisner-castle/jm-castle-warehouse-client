import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { ArticleRow } from "../../types/RowTypes";
import { ErrorData } from "../ErrorDisplays";

export type ArticleRefAutocompleteProps = {
  value: ArticleRow | undefined;
  onChange: (article: ArticleRow | null) => void;
  articles: ArticleRow[];
  errorData?: ErrorData;
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const ArticleRefAutocomplete = (props: ArticleRefAutocompleteProps) => {
  const {
    articles,
    value,
    onChange,
    label,
    errorData,
    helperText,
    ...textFieldProps
  } = props;
  const [inputValue, setInputValue] = useState(value?.articleId);

  const orderedArticles = useMemo(() => {
    return [...articles].sort((a, b) => a.articleId.localeCompare(b.articleId));
  }, [articles]);

  const { error } = errorData || {};

  const usedHelperText =
    error && helperText ? `${helperText}. ${error}` : error || helperText || "";

  return (
    <Autocomplete
      disablePortal
      id="articleRefEditor"
      getOptionLabel={(row) => row.articleId}
      isOptionEqualToValue={(a, b) => a.articleId === b.articleId}
      options={orderedArticles}
      value={value || null}
      onChange={(event, row) => {
        onChange(row);
      }}
      inputValue={inputValue || ""}
      onInputChange={(event, value) => setInputValue(value)}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...textFieldProps}
          {...params}
          error={!!error}
          helperText={usedHelperText}
          label={label || "Artikel"}
        />
      )}
    />
  );
};

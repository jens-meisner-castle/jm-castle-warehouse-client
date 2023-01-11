import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useState } from "react";
import { ArticleRow } from "../types/RowTypes";

export type ArticleRefEditorProps = {
  value: ArticleRow | undefined;
  onChange: (article: ArticleRow | null) => void;
  articles: ArticleRow[];
} & Omit<Omit<TextFieldProps, "value">, "onChange">;

export const ArticleRefEditor = (props: ArticleRefEditorProps) => {
  const { articles, value, onChange, ...textFieldProps } = props;
  const [inputValue, setInputValue] = useState(value?.articleId);

  return (
    <Autocomplete
      disablePortal
      id="articleRefEditor"
      getOptionLabel={(row) => row.articleId}
      options={articles}
      value={value || null}
      onChange={(event, row) => {
        onChange(row);
      }}
      inputValue={inputValue || ""}
      onInputChange={(event, value) => setInputValue(value)}
      fullWidth
      renderInput={(params) => (
        <TextField {...textFieldProps} {...params} label="Artikel" />
      )}
    />
  );
};

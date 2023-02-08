import { MenuItem, TextField } from "@mui/material";
import { CountUnits, isCountUnit } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import {
  ArticleRow,
  AttributeRow,
  HashtagRow,
  isSavingArticleAllowed,
  ManufacturerRow,
} from "../../types/RowTypes";
import { ManufacturerRefAutocomplete } from "../autocomplete/ManufacturerRefAutocomplete";
import { AttributesRefEditor } from "../multi-ref/AttributesRefEditor";
import { HashtagsRefEditor } from "../multi-ref/HashtagsRefEditor";
import { ImageRefsEditor } from "../multi-ref/ImageRefsEditor";
import { TextFieldWithSpeech } from "../TextFieldWithSpeech";

export interface ArticleEditorProps {
  row: Partial<ArticleRow>;
  mode: "edit" | "create";
  availableHashtags: HashtagRow[];
  availableManufacturers: ManufacturerRow[];
  availableAttributes: AttributeRow[];
  onChange: (updates: Partial<ArticleRow>) => void;
}

export const ArticleEditor = (props: ArticleEditorProps) => {
  const {
    row,
    mode,
    onChange,
    availableHashtags,
    availableManufacturers,
    availableAttributes,
  } = props;

  const { errorData } = isSavingArticleAllowed(row);

  const {
    articleId,
    name,
    manufacturer,
    hashtags,
    wwwLink,
    countUnit,
    imageRefs,
    attributes,
  } = row;

  const countUnits = useMemo(
    () =>
      Object.keys(CountUnits).map((k) => ({
        id: k,
        name: CountUnits[k as keyof typeof CountUnits].name,
      })),
    []
  );

  const currentHashtags = useMemo(() => {
    const newHashtags: HashtagRow[] = [];
    hashtags?.forEach((tagId) => {
      const hashtag = availableHashtags.find((r) => r.tagId === tagId);
      hashtag && newHashtags.push(hashtag);
    });
    return newHashtags;
  }, [hashtags, availableHashtags]);

  const currentManufacturer = useMemo(
    () => availableManufacturers.find((m) => m.manufacturerId === manufacturer),
    [availableManufacturers, manufacturer]
  );

  return (
    <div>
      <TextFieldWithSpeech
        disabled={mode === "edit"}
        autoFocus={mode === "create"}
        margin="dense"
        id="articleId"
        label="Artikel"
        value={articleId || ""}
        errorData={errorData.articleId}
        onChange={(s) => onChange({ articleId: s })}
        fullWidth
        variant="standard"
      />
      <TextFieldWithSpeech
        autoFocus={mode === "edit"}
        margin="dense"
        id="name"
        label="Name"
        value={name || ""}
        errorData={errorData.name}
        onChange={(s) => {
          onChange({ name: s });
        }}
        fullWidth
        variant="standard"
      />
      <ManufacturerRefAutocomplete
        margin="dense"
        errorData={errorData.manufacturer}
        value={currentManufacturer}
        onChange={(manufacturer) =>
          onChange({ manufacturer: manufacturer?.manufacturerId })
        }
        manufacturers={availableManufacturers}
        variant="standard"
        fullWidth
      />
      <HashtagsRefEditor
        value={currentHashtags}
        hashtags={availableHashtags}
        onChange={(hashtags) =>
          onChange({ hashtags: hashtags?.map((r) => r.tagId) })
        }
      />
      <TextField
        margin="dense"
        id="wwwLink"
        label="Link (www)"
        value={wwwLink || ""}
        onChange={(event) => onChange({ wwwLink: event.target.value })}
        type="text"
        fullWidth
        variant="standard"
      />
      <TextField
        margin="dense"
        id="countUnit"
        select
        label="Zähleinheit"
        value={countUnit || ""}
        onChange={(event) => {
          isCountUnit(event.target.value) &&
            onChange({ countUnit: event.target.value });
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
        onChange={(imageRefs) => onChange({ imageRefs })}
      />
      <AttributesRefEditor
        values={attributes}
        attributes={availableAttributes}
        onChange={(attributes) => onChange({ attributes })}
      />
    </div>
  );
};

import { Grid } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { CSSProperties } from "react";
import { StoreRefAutocomplete } from "../components/autocomplete/StoreRefAutocomplete";
import { StoreSectionRefAutocomplete } from "../components/autocomplete/StoreSectionRefAutocomplete";
import { ErrorDisplays } from "../components/ErrorDisplays";
import { HashtagsRefEditor } from "../components/multi-ref/HashtagsRefEditor";
import { TextFieldWithSpeech } from "../components/TextFieldWithSpeech";
import { backendApiUrl } from "../configuration/Urls";
import { useFilterData } from "./FilterData";
import { ArbitraryFilter } from "./Types";

export type FilterAspect =
  | "hashtag"
  | "nameFragment"
  | "store"
  | "storeSection";

export interface ArbitraryFilterComponentProps {
  filter: ArbitraryFilter;
  onChange: (changes: Partial<ArbitraryFilter>) => void;
  aspects: FilterAspect[];
  helpNameFragment?: string;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

export const ArbitraryFilterComponent = (
  props: ArbitraryFilterComponentProps
) => {
  const { filter, onChange, helpNameFragment, aspects, handleExpiredToken } =
    props;
  const { hashtags, nameFragment, storeId, sectionId } = filter;

  const { errors, rows } = useFilterData(
    backendApiUrl,
    aspects,
    handleExpiredToken
  );
  const { storeRows, hashtagRows, sectionRows } = rows;

  const currentStore = storeRows?.find((r) => r.storeId === storeId);
  const currentSection = sectionRows?.find((r) => r.sectionId === sectionId);
  const currentHashtags = hashtagRows?.filter((r) =>
    hashtags?.includes(r.tagId)
  );

  const elementContainerStyle: CSSProperties = {
    height: "100%",
    marginRight: 10,
    paddingLeft: 5,
    paddingRight: 5,
  };

  return (
    <Grid container direction="row">
      <Grid item>
        <ErrorDisplays results={errors} />
      </Grid>
      {aspects.includes("nameFragment") && (
        <Grid item>
          <div style={elementContainerStyle}>
            <TextFieldWithSpeech
              margin="dense"
              id="nameFragment"
              label="Name (Fragment)"
              value={nameFragment || ""}
              onChange={(s) => {
                onChange({ nameFragment: s });
              }}
              fullWidth
              variant="standard"
              helperText={helpNameFragment}
            />
          </div>
        </Grid>
      )}
      {aspects.includes("store") && (
        <Grid item style={{ minWidth: 250 }}>
          <div style={elementContainerStyle}>
            <StoreRefAutocomplete
              value={currentStore}
              stores={storeRows || []}
              onChange={(store) => onChange({ storeId: store?.storeId })}
              margin="dense"
              fullWidth
              variant="standard"
              helperText="Wählen Sie ein Lager"
            />
          </div>
        </Grid>
      )}
      {aspects.includes("storeSection") && (
        <Grid item style={{ minWidth: 250 }}>
          <div style={elementContainerStyle}>
            <StoreSectionRefAutocomplete
              value={currentSection}
              sections={sectionRows || []}
              onChange={(section) =>
                onChange({ sectionId: section?.sectionId })
              }
              fullWidth
              variant="standard"
              margin="dense"
            />
          </div>
        </Grid>
      )}

      {aspects.includes("hashtag") && (
        <Grid item>
          <div style={elementContainerStyle}>
            <HashtagsRefEditor
              value={currentHashtags}
              hashtags={hashtagRows || []}
              onChange={(hashtags) =>
                onChange({ hashtags: hashtags?.map((r) => r.tagId) })
              }
            />
          </div>
        </Grid>
      )}
    </Grid>
  );
};

import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button, Grid, Tooltip, Typography } from "@mui/material";
import { StoreSectionRow } from "../types/RowTypes";
import { ImagesSlide } from "./ImagesSlide";
import {
  buttonSizeForSize,
  SizeVariant,
  typoVariantForSize,
} from "./SizeVariant";

export interface StoreSectionComponentProps {
  section: StoreSectionRow;
  sizeVariant: SizeVariant;
  onAdd?: (section: StoreSectionRow) => void;
  onAddHelp?: string;
}

export const StoreSectionComponent = (props: StoreSectionComponentProps) => {
  const { section, onAdd, onAddHelp, sizeVariant } = props;
  const { sectionId, imageRefs, storeId } = section;
  const typoVariant = typoVariantForSize(sizeVariant);
  const buttonSize = buttonSizeForSize(sizeVariant);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant={typoVariant} align="center">
          {sectionId}
        </Typography>
        <Typography variant={typoVariant} align="center">
          {` (in: ${storeId})`}
        </Typography>
      </Grid>
      <Grid item>
        <ImagesSlide imageRefs={imageRefs} sizeVariant={sizeVariant} />
      </Grid>
      {onAdd && (
        <Grid item>
          {onAddHelp ? (
            <Tooltip title={onAddHelp}>
              <Button
                size={buttonSize}
                variant="contained"
                onClick={() => onAdd(section)}
              >
                <AddBoxIcon />
              </Button>
            </Tooltip>
          ) : (
            <Button
              size={buttonSize}
              variant="contained"
              onClick={() => onAdd(section)}
            >
              <AddBoxIcon />
            </Button>
          )}
        </Grid>
      )}
    </Grid>
  );
};

import AddBoxIcon from "@mui/icons-material/AddBox";
import { Grid, IconButton, Typography } from "@mui/material";
import { StoreSectionRow } from "../types/RowTypes";
import { ImagesSlide } from "./ImagesSlide";

export interface StoreSectionComponentProps {
  section: StoreSectionRow;
  onAdd?: (section: StoreSectionRow) => void;
}

export const StoreSectionComponent = (props: StoreSectionComponentProps) => {
  const { section, onAdd } = props;
  const { sectionId, imageRefs } = section;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography align="center">{sectionId}</Typography>
      </Grid>
      <Grid item>
        <ImagesSlide imageRefs={imageRefs} maxSize={250} />
      </Grid>
      {onAdd && (
        <Grid item>
          <IconButton onClick={() => onAdd(section)}>
            <AddBoxIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
};

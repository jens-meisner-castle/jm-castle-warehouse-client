import { Grid, Typography } from "@mui/material";
import { Row_ImageContent } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface ImagesProps {
  images: Row_ImageContent[];
}

export const Images = (props: ImagesProps) => {
  const { images } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/image" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/image?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Bilder (${images.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

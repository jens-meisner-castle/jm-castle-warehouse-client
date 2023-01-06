import { Grid, Typography } from "@mui/material";
import { Row_Hashtag } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface HashtagsProps {
  hashtags: Row_Hashtag[];
}

export const Hashtags = (props: HashtagsProps) => {
  const { hashtags } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/hashtag" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/hashtag?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Hashtags (${hashtags.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

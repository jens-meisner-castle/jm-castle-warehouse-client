import { Grid, Typography } from "@mui/material";
import { Row_Article } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { AppAction, AppActions } from "../../../../components/AppActions";

export interface ArticlesProps {
  articles: Row_Article[];
}

export const Articles = (props: ArticlesProps) => {
  const { articles } = props;
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/article" },
    });
    newActions.push({
      label: "New",
      onClickNavigate: { to: "/masterdata/article?action=new" },
    });
    return newActions;
  }, []);
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Artikel (${articles.length})`}</Typography>
      </Grid>
      <Grid item>
        <AppActions actions={actions} />
      </Grid>
    </Grid>
  );
};

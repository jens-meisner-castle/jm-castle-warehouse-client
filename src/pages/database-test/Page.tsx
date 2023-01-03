import { Grid, Paper, Typography } from "@mui/material";
import { InsertExampleHome } from "../../tests/database/InsertExampleHome";
import { InsertTestArticle } from "../../tests/database/InsertTestArticle";
import { SelectFromArticle } from "../../tests/database/SelectFromArticle";
import { SelectFromStore } from "../../tests/database/SelectFromStore";

export const Page = () => {
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Some tests"}</Typography>
      </Grid>
      <Grid item>
        <Paper>
          <SelectFromStore />
        </Paper>
      </Grid>
      <Grid item>
        <Paper style={{ marginTop: 5 }}>
          <SelectFromArticle />
        </Paper>
      </Grid>
      <Grid item>
        <Paper style={{ marginTop: 5 }}>
          <InsertTestArticle />
        </Paper>
      </Grid>
      <Grid item>
        <Paper style={{ marginTop: 5 }}>
          <InsertExampleHome />
        </Paper>
      </Grid>
    </Grid>
  );
};

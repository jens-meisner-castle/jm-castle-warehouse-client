import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Grid, Typography } from "@mui/material";
import {
  AppAction,
  AppActions,
  TextareaComponent,
} from "jm-castle-components/build";
import { Row_Article } from "jm-castle-warehouse-types/build";
import { useCallback, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { backendApiUrl } from "../../configuration/Urls";
import { useArticleInsert } from "../../hooks/useArticleInsert";
import { toRawMasterdataFields } from "../../types/RowTypes";

export const InsertTestArticle = () => {
  const [indicatorSelect, setIndicatorSelect] = useState(0);
  const [article, setArticle] = useState<Row_Article | undefined>(undefined);
  const handleExpiredToken = useHandleExpiredToken();
  const { error, response, errorDetails, errorCode } = useArticleInsert(
    backendApiUrl,
    article,
    indicatorSelect,
    handleExpiredToken
  );
  const { cmd } = response?.result || {};
  const executeTest = useCallback(() => {
    let nextArticleNumber = -1;
    setIndicatorSelect((previous) => {
      nextArticleNumber = previous + 1;
      return nextArticleNumber;
    });
    setArticle({
      article_id: `test-${nextArticleNumber}`,
      name: `test Artikel ${nextArticleNumber}`,
      hashtags: null,
      count_unit: "piece",
      ...toRawMasterdataFields({
        datasetVersion: 1,
        createdAt: new Date(),
        editedAt: new Date(),
      }),
      image_refs: null,
      www_link: null,
      manufacturer: "unknown",
      attributes: JSON.stringify({ test: true }),
    });
  }, []);
  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <PlayCircleFilledIcon />,
      onClick: executeTest,
    });
    return newActions;
  }, [executeTest]);
  const leftColumnWidth = 200;

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Test: Insert article"}</Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Controls"}</Typography>
          </Grid>
          <Grid item>
            <AppActions actions={actions} />
          </Grid>
        </Grid>
      </Grid>
      {errorCode && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error code"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <Typography>{errorCode}</Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      {error && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={error}
                maxRows={10}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
      {errorDetails && (
        <Grid item>
          <Grid container direction="row">
            <Grid item style={{ width: leftColumnWidth }}>
              <Typography>{"Error details"}</Typography>
            </Grid>
            <Grid item flexGrow={1}>
              <TextareaComponent
                value={errorDetails}
                formatObject
                maxRows={10}
                style={{
                  width: "90%",
                  resize: "none",
                  marginRight: 30,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Command"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={cmd || ""}
              maxRows={10}
              style={{
                width: "90%",
                resize: "none",
                marginRight: 30,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={{ width: leftColumnWidth }}>
            <Typography>{"Article to insert"}</Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <TextareaComponent
              value={article || ""}
              formatObject
              maxRows={10}
              style={{
                width: "90%",
                resize: "none",
                marginRight: 30,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

import { Button, Grid, Typography } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useEffect, useMemo } from "react";
import { backendApiUrl } from "../../configuration/Urls";
import { useArticleFind } from "../../hooks/useArticleFind";
import { useStoreSectionFind } from "../../hooks/useStoreSectionFind";
import { fromRawArticle, fromRawStoreSection } from "../../types/RowTypes";
import { useStartUsecase } from "../context/UsecaseContext";
import { RelocateState } from "../Types";

export interface RelocateStarterProps {
  params?: Record<string, string[]>;
  handleExpiredToken: (errorCode: ErrorCode | undefined) => void;
}

const usecaseState: RelocateState = {
  id: "relocate",
  data: {},
};

export const RelocateStarter = (props: RelocateStarterProps) => {
  const { params, handleExpiredToken } = props;

  const startUsecase = useStartUsecase();

  const startParams = useMemo(() => {
    if (!params) return undefined;
    const {
      sectionId: sectionIdArr,
      articleId: articleIdArr,
      usecase: usecaseArr,
    } = params;
    const sectionId = sectionIdArr?.length ? sectionIdArr[0] : undefined;
    const articleId = articleIdArr?.length ? articleIdArr[0] : undefined;
    const usecase = usecaseArr?.length ? usecaseArr[0] : undefined;
    if (!usecase) {
      return undefined;
    }
    return { sectionId, articleId, usecase };
  }, [params]);

  const { sectionId, articleId, usecase } = startParams || {};

  const sectionApiResponse = useStoreSectionFind(
    backendApiUrl,
    sectionId,
    1,
    handleExpiredToken
  );
  const { response: sectionResponse } = sectionApiResponse;
  const { result: sectionResult } = sectionResponse || {};
  const { row: sectionRow } = sectionResult || {};

  const articleApiResponse = useArticleFind(
    backendApiUrl,
    articleId,
    1,
    handleExpiredToken
  );
  const { response: articleResponse } = articleApiResponse;
  const { result: articleResult } = articleResponse || {};
  const { row: articleRow } = articleResult || {};

  useEffect(() => {
    if (!usecase) return;
    if (sectionId && !sectionRow) return;
    if (articleId && !articleRow) return;
    // also ist das, was da sein soll, auch da
    startUsecase({
      id: "relocate",
      data: {
        from: sectionRow && fromRawStoreSection(sectionRow),
        article: articleRow && fromRawArticle(articleRow),
      },
    });
  }, [sectionRow, articleRow, articleId, sectionId, usecase, startUsecase]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{"Umlagern"}</Typography>
      </Grid>
      <Grid item>
        <Button onClick={() => startUsecase(usecaseState)} variant="contained">
          {"Starten"}
        </Button>
      </Grid>
    </Grid>
  );
};

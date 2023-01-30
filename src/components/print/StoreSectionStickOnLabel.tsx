import { Grid, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";
import { getCompleteUrlForPath } from "../../configuration/Urls";
import { allRoutes } from "../../navigation/AppRoutes";
import { StoreSectionRow } from "../../types/RowTypes";

export interface StoreSectionStickOnLabelProps {
  section: StoreSectionRow;
}

export const StoreSectionStickOnLabel = (
  props: StoreSectionStickOnLabelProps
) => {
  const { section } = props;

  const { sectionId, shortId } = section;

  const qrCodeContent = useMemo(() => {
    const url = getCompleteUrlForPath(allRoutes().stockSectionDetail.path);
    const params = new URLSearchParams({ sectionId });
    return `${url}?${params.toString()}`;
  }, [sectionId]);

  return (
    <Grid container direction="row" alignItems="center">
      <Grid style={{ width: "50%" }} item>
        <Typography align="center" variant="h1">
          {shortId}
        </Typography>
      </Grid>
      <Grid style={{ width: "50%" }} item>
        <Grid
          container
          direction="column"
          style={{
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Grid item>
            <QRCodeSVG value={qrCodeContent} width={150} height={150} />
          </Grid>
          <Grid item>
            <Typography align="center" variant="h6">
              {sectionId}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

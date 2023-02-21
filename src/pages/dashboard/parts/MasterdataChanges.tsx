import { Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ErrorDisplays } from "../../../components/ErrorDisplays";
import { SizeVariant } from "../../../components/SizeVariant";
import { MasterdataChangeTable } from "../../../components/table/MasterdataChangeTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeintervalFilter } from "../../../filter/Types";
import { useMasterdataEditedbyInterval } from "../../../hooks/useMasterdataEditedByInterval";
import {
  compareMasterdataChangeRow,
  MasterdataChangeRow,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import { getFilteredOrderedRows } from "../../../utils/Compare";

export interface MasterdataChangesProps {
  filter: TimeintervalFilter;
  sizeVariant: SizeVariant;
}

export const MasterdataChanges = (props: MasterdataChangesProps) => {
  const { filter, sizeVariant } = props;
  const handleExpiredToken = useHandleExpiredToken();

  const [order, setOrder] = useState<OrderElement<MasterdataChangeRow>[]>([
    { field: "editedAt", direction: "descending" },
  ]);

  const { rows, errors: errorData } = useMasterdataEditedbyInterval(
    backendApiUrl,
    { article: true, imageContent: true, section: true },
    filter.from,
    filter.to,
    1,
    handleExpiredToken
  );

  const filteredOrderedRows = useMemo(() => {
    const all: MasterdataChangeRow[] = [];
    const { articleRows, sectionRows, imageContentRows } = rows;
    if (articleRows && sectionRows && imageContentRows) {
      articleRows.forEach((r) =>
        all.push({
          what: "Artikel",
          id: r.articleId,
          editedAt: r.editedAt,
          createdAt: r.createdAt,
        })
      );
      sectionRows.forEach((r) =>
        all.push({
          what: "Lagerbereich",
          id: r.sectionId,
          editedAt: r.editedAt,
          createdAt: r.createdAt,
        })
      );
      imageContentRows.forEach((r) =>
        all.push({
          what: "Bild",
          id: r.imageId,
          editedAt: r.editedAt,
          createdAt: r.createdAt,
        })
      );
    }
    return getFilteredOrderedRows(
      all,
      () => true,
      order,
      compareMasterdataChangeRow
    );
  }, [rows, order]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Stammdaten Änderungen (${filter.from.toFormat(
          "dd. LLL"
        )} - ${filter.to.toFormat("dd. LLL")})`}</Typography>
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5 }}>
          <MasterdataChangeTable
            data={filteredOrderedRows || []}
            sizeVariant={sizeVariant}
            order={order}
            onOrderChange={setOrder}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

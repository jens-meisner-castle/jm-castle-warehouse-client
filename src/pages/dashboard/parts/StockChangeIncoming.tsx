import { Paper, Typography } from "@mui/material";
import { useMemo } from "react";
import { StockChangeTable } from "../../../components/StockChangeTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeintervalFilter } from "../../../filter/Types";
import { useReceiptSelect } from "../../../hooks/useReceiptSelect";
import { StockChangingRow } from "../../../types/RowTypes";

export interface StockChangeIncomingProps {
  filter: TimeintervalFilter;
}

export const StockChangeIncoming = (props: StockChangeIncomingProps) => {
  const { filter } = props;
  const { result, error } = useReceiptSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    1
  );
  const { dataPerArticle, allRows } = useMemo(() => {
    const newPerArticle: Record<
      string,
      {
        rows: StockChangingRow[];
      }
    > = {};
    const allRows: StockChangingRow[] = [];
    if (result) {
      const { rows } = result;
      rows.forEach((row) => {
        let perArticle = newPerArticle[row.article_id];
        if (!perArticle) {
          perArticle = { rows: [] };
          newPerArticle[row.article_id] = perArticle;
        }
        const newRow: StockChangingRow = {
          type: "in",
          articleId: row.article_id,
          at: new Date(row.at_seconds * 1000),
          sectionId: row.section_id,
          by: row.by_user,
          count: row.article_count,
        };
        perArticle.rows.push(newRow);
        allRows.push(newRow);
      });
    }

    return { dataPerArticle: newPerArticle, allRows };
  }, [result]);
  console.log(dataPerArticle);

  return (
    <Paper
      style={{
        padding: 5,
        margin: 5,
        marginTop: 0,
        marginLeft: 0,
        maxWidth: 600,
        minWidth: 400,
      }}
    >
      {error && <Typography>{"Error from receipt log: " + error}</Typography>}

      <StockChangeTable
        data={allRows}
        containerStyle={{ maxWidth: 600 }}
        cellSize="small"
      />
    </Paper>
  );
};

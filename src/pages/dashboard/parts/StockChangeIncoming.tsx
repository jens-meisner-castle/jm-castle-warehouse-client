import { Grid, Paper } from "@mui/material";
import { useMemo } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { StockChangeTable } from "../../../components/StockChangeTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeintervalFilter } from "../../../filter/Types";
import { useReceiptSelect } from "../../../hooks/useReceiptSelect";
import {
  StockChangingRow,
  stockChangingRowFromRawReceipt,
} from "../../../types/RowTypes";

export interface StockChangeIncomingProps {
  filter: TimeintervalFilter;
}

export const StockChangeIncoming = (props: StockChangeIncomingProps) => {
  const { filter } = props;
  const handleExpiredToken = useHandleExpiredToken();

  const receiptApiResponse = useReceiptSelect(
    backendApiUrl,
    filter.from,
    filter.to,
    1,
    handleExpiredToken
  );
  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.receipt = receiptApiResponse;
    return newData;
  }, [receiptApiResponse]);
  const { response: receiptResponse } = receiptApiResponse;
  const { result: receiptResult } = receiptResponse || {};
  const { rows: receiptRows } = receiptResult || {};
  const { allRows } = useMemo(() => {
    const allRows: StockChangingRow[] = [];
    receiptRows?.forEach((row) => {
      const newRow = stockChangingRowFromRawReceipt(row);
      allRows.push(newRow);
    });
    return { allRows };
  }, [receiptRows]);

  return (
    <Grid container direction="column">
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5 }}>
          <StockChangeTable data={allRows} cellSize="small" />
        </Paper>
      </Grid>
    </Grid>
  );
};

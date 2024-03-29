import { Grid, Paper } from "@mui/material";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { SizeVariant } from "../../../components/SizeVariant";
import { StockChangeTable } from "../../../components/table/StockChangeTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeintervalFilter } from "../../../filter/Types";
import { useReceiptSelectByInterval } from "../../../hooks/useReceiptSelectByInterval";
import {
  compareStockChangingRow,
  StockChangingRow,
  stockChangingRowFromRawReceipt,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import { getFilteredOrderedRows } from "../../../utils/Compare";

export interface StockChangeIncomingProps {
  filter: TimeintervalFilter;
  sizeVariant: SizeVariant;
}

export const StockChangeIncoming = (props: StockChangeIncomingProps) => {
  const { filter, sizeVariant } = props;
  const handleExpiredToken = useHandleExpiredToken();

  const [order, setOrder] = useState<OrderElement<StockChangingRow>[]>([
    { field: "at", direction: "descending" },
  ]);

  const receiptApiResponse = useReceiptSelectByInterval(
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
    const all: StockChangingRow[] = [];
    receiptRows?.forEach((row) => {
      const newRow = stockChangingRowFromRawReceipt(row);
      all.push(newRow);
    });
    return { allRows: all };
  }, [receiptRows]);

  const filteredOrderedRows = useMemo(() => {
    return getFilteredOrderedRows(
      allRows,
      () => true,
      order,
      compareStockChangingRow
    );
  }, [allRows, order]);

  return (
    <Grid container direction="column">
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5 }}>
          <StockChangeTable
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

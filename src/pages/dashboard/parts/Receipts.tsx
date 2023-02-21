import { Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { SizeVariant } from "../../../components/SizeVariant";
import { ReceiptsTable } from "../../../components/table/ReceiptsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { TimeintervalFilter } from "../../../filter/Types";
import { useReceiptSelectByInterval } from "../../../hooks/useReceiptSelectByInterval";
import {
  compareReceiptRow,
  fromRawReceipt,
  ReceiptRow,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import { getFilteredOrderedRows } from "../../../utils/Compare";

export interface ReceiptsProps {
  filter: TimeintervalFilter;
  sizeVariant: SizeVariant;
}

export const Receipts = (props: ReceiptsProps) => {
  const { filter, sizeVariant } = props;
  const handleExpiredToken = useHandleExpiredToken();

  const [order, setOrder] = useState<OrderElement<ReceiptRow>[]>([
    { field: "receiptAt", direction: "descending" },
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
    const all: ReceiptRow[] = [];
    receiptRows?.forEach((row) => {
      const newRow = fromRawReceipt(row);
      all.push(newRow);
    });
    return { allRows: all };
  }, [receiptRows]);

  const filteredOrderedRows = useMemo(() => {
    return getFilteredOrderedRows(
      allRows,
      () => true,
      order,
      compareReceiptRow
    );
  }, [allRows, order]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography>{`Wareneingänge (${filter.from.toFormat(
          "dd. LLL"
        )} - ${filter.to.toFormat("dd. LLL")})`}</Typography>
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5 }}>
          <ReceiptsTable
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

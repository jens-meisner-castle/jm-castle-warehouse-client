import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useCallback, useMemo, useState } from "react";
import { useAppActionFilter } from "../../app-action/useAppActionFilter";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../components/ErrorDisplays";
import { FilteredRowsDisplay } from "../../components/FilteredRowsDisplay";
import {
  sizeVariantForWidth,
  StockChangeTable,
} from "../../components/table/StockChangeTable";
import { backendApiUrl } from "../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../filter/ArbitraryFilterComponent";
import { TimeFilterComponent } from "../../filter/TimeFilterComponent";
import { FilterAspect } from "../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../filter/useArbitraryFilter";
import { useTimeintervalFilter } from "../../filter/useTimeintervalFilter";
import { useEmissionSelect } from "../../hooks/useEmissionSelect";
import { useReceiptSelectByInterval } from "../../hooks/useReceiptSelectByInterval";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  compareStockChangingRow,
  StockChangingRow,
  stockChangingRowFromRawEmission,
  stockChangingRowFromRawReceipt,
} from "../../types/RowTypes";
import { OrderElement } from "../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../utils/Compare";
import { getNewFilter } from "../../utils/Filter";

const filterTest: FilterTest<StockChangingRow> = {
  nameFragment: ["articleId"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const handleExpiredToken = useHandleExpiredToken();

  const [order, setOrder] = useState<OrderElement<StockChangingRow>[]>([
    { field: "at", direction: "descending" },
  ]);
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";

  const { timeFilter, handleTimeFilterChange } = useTimeintervalFilter(
    getNewFilter({
      from: DateTime.now().minus({ days: 7 }).startOf("day"),
      to: DateTime.now().endOf("day"),
    })
  );

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const { isFilterVisible, filterAction } = useAppActionFilter(false);

  const [updateIndicator, setUpdateIndicator] = useState(1);

  const receiptApiResponse = useReceiptSelectByInterval(
    backendApiUrl,
    timeFilter.from,
    timeFilter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: receiptResponse } = receiptApiResponse;

  const emissionApiResponse = useEmissionSelect(
    backendApiUrl,
    timeFilter.from,
    timeFilter.to,
    updateIndicator,
    handleExpiredToken
  );
  const { response: emissionResponse } = emissionApiResponse;
  const { result: emissionResult } = emissionResponse || {};
  const { result: receiptResult } = receiptResponse || {};
  const { rows: receiptRows } = receiptResult || {};
  const { rows: emissionRows } = emissionResult || {};
  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.receipt = receiptApiResponse;
    newData.emission = emissionApiResponse;
    return newData;
  }, [receiptApiResponse, emissionApiResponse]);

  const filteredOrderedRows = useMemo(() => {
    const filtered: StockChangingRow[] = [];
    if (receiptRows) {
      receiptRows.forEach((raw) => {
        const row = stockChangingRowFromRawReceipt(raw);
        passFilter(row) && filtered.push(row);
      });
    }

    if (emissionRows) {
      emissionRows.forEach((raw) => {
        const row = stockChangingRowFromRawEmission(raw);
        passFilter(row) && filtered.push(row);
      });
    }

    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<StockChangingRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareStockChangingRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [receiptRows, emissionRows, passFilter, order]);

  const refresh = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
  }, []);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: (
        <Tooltip title="Daten aktualisieren">
          <RefreshIcon />
        </Tooltip>
      ),
      onClick: refresh,
    });
    newActions.push(filterAction);
    return newActions;
  }, [refresh, filterAction]);

  return (
    <>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"History"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        {isFilterVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5 }}>
              <TimeFilterComponent
                filter={timeFilter}
                onChange={handleTimeFilterChange}
              />
            </Paper>
          </Grid>
        )}
        {isFilterVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5, padding: 5 }}>
              <ArbitraryFilterComponent
                filter={filter}
                onChange={handleFilterChange}
                aspects={filterAspects}
                helpNameFragment={"Sucht in der Artikel ID."}
                handleExpiredToken={handleExpiredToken}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <FilteredRowsDisplay
            all={[receiptRows, emissionRows]}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        <Grid item>
          <StockChangeTable
            data={filteredOrderedRows}
            order={order}
            onOrderChange={setOrder}
            sizeVariant={tableSize}
            containerStyle={{ width: "100%", maxWidth: 1200 }}
          />
        </Grid>
      </Grid>
    </>
  );
};

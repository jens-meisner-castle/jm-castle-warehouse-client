import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tuple } from "victory";
import { AppAction, AppActions } from "../../components/AppActions";
import { StockChangeTable } from "../../components/StockChangeTable";
import { backendApiUrl } from "../../configuration/Urls";
import { FilterComponent } from "../../filter/FilterComponent";
import { TimeintervalFilter } from "../../filter/Types";
import { useEmissionLogSelect } from "../../hooks/useEmissionLogSelect";
import { useReceiptLogSelect } from "../../hooks/useReceiptLogSelect";
import { StockChangingRow } from "../../types/RowTypes";
import { getNewFilter } from "../../utils/Filter";
import {
  loadFilterForPage,
  loadOptionsForPage,
  storeFilterForPage,
  storeOptionsForPage,
} from "../../utils/LocalStorage";
import { getNewOptions, PageOptions } from "./parts/OptionsComponent";
import { OptionsMenu } from "./parts/OptionsMenu";

export const pageUrl = "/history";

export const Page = () => {
  const [pageOptions, setPageOptions] = useState(
    getNewOptions(loadOptionsForPage(pageUrl) || {})
  );
  const handleNewOptions = useCallback((newOptions: Partial<PageOptions>) => {
    let mergedOptions: PageOptions | Partial<PageOptions> = {};
    setPageOptions((previous) => {
      mergedOptions = { ...previous, ...newOptions };
      return { ...previous, ...newOptions };
    });
    mergedOptions && storeOptionsForPage(mergedOptions, pageUrl);
  }, []);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsSelectionRef = useRef<HTMLButtonElement | null>(null);

  const { chartWidthFactor, isTableVisible } = pageOptions;
  const initialFilter = useMemo(
    () => getNewFilter(loadFilterForPage(pageUrl)),
    []
  );
  const [filter, setFilter] = useState<TimeintervalFilter>(initialFilter);
  const handleFilterChange = useCallback((newFilter: TimeintervalFilter) => {
    storeFilterForPage(newFilter, pageUrl);
    setFilter(newFilter);
  }, []);
  const ref = useRef<HTMLDivElement | null>(null);
  const [indicatorSelect, setIndicatorSelect] = useState(1);

  const [width, setWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    const newWidth = ref.current ? ref.current.offsetWidth : undefined;
    newWidth && setWidth(newWidth);
  }, [indicatorSelect]);
  const chartsPerRow = width
    ? width > 1800
      ? 4
      : width > 1400
      ? 3
      : width > 900
      ? 2
      : 1
    : 1;
  const usedWidth = width ? width - 20 : undefined;
  const calculatedChartWidth = usedWidth
    ? Math.floor(usedWidth / chartsPerRow)
    : undefined;
  const chartHeight =
    calculatedChartWidth && Math.min(Math.round(calculatedChartWidth / 2), 500);
  const chartWidth = calculatedChartWidth
    ? calculatedChartWidth * chartWidthFactor
    : undefined;
  const maxTableWidth =
    usedWidth && calculatedChartWidth && isTableVisible
      ? Math.min(usedWidth, calculatedChartWidth * 1.5)
      : undefined;
  const tableHeight = chartHeight ? 3 * chartHeight : 250;
  const restWidthForAllCharts =
    usedWidth && maxTableWidth ? usedWidth - maxTableWidth : undefined;
  const usedWidthForAllCharts =
    restWidthForAllCharts && chartWidth
      ? restWidthForAllCharts > chartWidth
        ? restWidthForAllCharts
        : usedWidth
      : undefined;
  const xDomain = useMemo((): Tuple<Date> => {
    return [filter.from.toJSDate(), filter.to.toJSDate()];
  }, [filter]);
  const { error: selectError1, result: selectResultReceiptLog } =
    useReceiptLogSelect(backendApiUrl, filter.from, filter.to, indicatorSelect);
  const { error: selectError2, result: selectResultEmissionLog } =
    useEmissionLogSelect(
      backendApiUrl,
      filter.from,
      filter.to,
      indicatorSelect
    );
  const { rowsPerStockChange, tableData } = useMemo(() => {
    const newTableData: StockChangingRow[] = [];
    const newPerStockChange: {
      in: {
        rows: StockChangingRow[];
      };
      out: {
        rows: StockChangingRow[];
      };
    } = { in: { rows: [] }, out: { rows: [] } };

    selectResultReceiptLog?.rows?.forEach((row) => {
      const newRow: StockChangingRow = {
        type: "in",
        sectionId: row.section_id,
        articleId: row.article_id,
        at: new Date(row.at * 1000),
        count: row.count,
        by: row.by,
      };
      newTableData.push(newRow);
      newPerStockChange.in.rows.push(newRow);
    });
    selectResultEmissionLog?.rows?.forEach((row) => {
      const newRow: StockChangingRow = {
        type: "out",
        sectionId: row.section_id,
        articleId: row.article_id,
        at: new Date(row.at * 1000),
        count: row.count,
        by: row.by,
      };
      newTableData.push(newRow);
      newPerStockChange.out.rows.push(newRow);
    });
    newTableData.sort((a, b) =>
      a.at === b.at
        ? a.articleId.localeCompare(b.articleId)
        : a.at.getTime() - b.at.getTime()
    );
    return {
      rowsPerStockChange: newPerStockChange,
      tableData: newTableData,
    };
  }, [selectResultEmissionLog, selectResultReceiptLog]);

  console.log(xDomain, rowsPerStockChange, usedWidthForAllCharts);
  const executeSelect = useCallback(() => {
    setIndicatorSelect((previous) => previous + 1);
  }, []);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({ label: "Refresh", onClick: executeSelect });
    newActions.push({
      label: "Options",
      onClick: () => setIsOptionsVisible((previous) => !previous),
      elementRef: optionsSelectionRef,
    });
    return newActions;
  }, [executeSelect]);

  return (
    <>
      {isOptionsVisible && (
        <OptionsMenu
          options={pageOptions}
          onChange={handleNewOptions}
          onClose={() => setIsOptionsVisible(false)}
          anchorEl={optionsSelectionRef.current}
        />
      )}
      <div ref={ref} style={{ width: "100%" }} />
      {chartWidth && chartHeight && (
        <Grid container direction="column">
          <Grid item>
            <Typography variant="h5">{"History"}</Typography>
          </Grid>
          <Grid item>
            <Paper>
              <AppActions actions={actions} />
            </Paper>
          </Grid>
          <Grid item>
            <Paper>
              <FilterComponent filter={filter} onChange={handleFilterChange} />
            </Paper>
          </Grid>
          {selectError1 && (
            <Grid item>
              <Typography>{selectError1}</Typography>
            </Grid>
          )}
          {selectError2 && (
            <Grid item>
              <Typography>{selectError2}</Typography>
            </Grid>
          )}
          <Grid container direction="row">
            {isTableVisible && (
              <Grid item style={{ width: maxTableWidth }}>
                <StockChangeTable
                  data={tableData}
                  cellSize="small"
                  containerStyle={{
                    maxWidth: maxTableWidth,
                    height: tableHeight,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
};

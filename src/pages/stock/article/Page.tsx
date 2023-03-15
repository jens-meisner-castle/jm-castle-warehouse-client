import { NorthEast, SouthWest } from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppActionFilter } from "../../../app-action/useAppActionFilter";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { FilteredRowsDisplay } from "../../../components/FilteredRowsDisplay";
import { sizeVariantForWidth } from "../../../components/table/EmissionsTable";
import { StockArticlesTable } from "../../../components/table/StockArticlesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useStockArticleAll } from "../../../hooks/useStockArticleAll";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareStockArticleRow,
  stockArticleExtRowsFromStockState,
  StockArticleRowExt,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import { getValidInitialAction } from "../utils/Reducer";

const filterTest: FilterTest<StockArticleRowExt> = {
  nameFragment: ["articleId", "name"],
  hashtags: ["hashtags"],
  storeSection: [],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const [order, setOrder] = useState<OrderElement<StockArticleRowExt>[]>([
    { field: "articleId", direction: "ascending" },
  ]);
  const { isFilterVisible, filterAction } = useAppActionFilter(false);

  const passPageFilter = useCallback(
    (article: StockArticleRowExt) => {
      const pass = passFilter(article);
      if (!pass) return false;
      const { storeSection } = filter;
      if (storeSection?.length) {
        if (
          !article.sectionStates.find(
            (state) => state.section.sectionId === storeSection
          )
        ) {
          return false;
        }
      }
      return true;
    },
    [filter, passFilter]
  );
  const handleExpiredToken = useHandleExpiredToken();

  const stockApiResponse = useStockArticleAll(
    backendApiUrl,
    updateIndicator,
    handleExpiredToken
  );
  const { response: stock } = stockApiResponse;

  const stockArticleRows = useMemo(() => {
    return stock ? stockArticleExtRowsFromStockState(stock) : [];
  }, [stock]);

  const filteredOrderedRows = useMemo(() => {
    const filtered = stockArticleRows.filter((row) => passPageFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<StockArticleRowExt>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareStockArticleRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [stockArticleRows, passPageFilter, order]);

  const navigate = useNavigate();
  const { action } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().stockArticle.path, { replace: true }),
    [initialAction, navigate]
  );

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.stock = stockApiResponse;
    return newData;
  }, [stockApiResponse]);

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    resetInitialAction();
  }, [resetInitialAction]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push(filterAction);
    newActions.push({
      label: (
        <Tooltip title="Neuer Wareneingang">
          <SouthWest />
        </Tooltip>
      ),
      onClick: () => navigate(`${allRoutes().stockReceipt.path}?action=new`),
    });
    newActions.push({
      label: (
        <Tooltip title="Neuer Warenausgang">
          <NorthEast />
        </Tooltip>
      ),
      onClick: () => navigate(`${allRoutes().stockEmission.path}?action=new`),
    });
    return newActions;
  }, [refreshStatus, navigate, filterAction]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h5">{"Artikelbestand"}</Typography>
      </Grid>
      <Grid item>
        <Paper style={{ padding: 5, marginBottom: 5 }}>
          <AppActions actions={actions} />
        </Paper>
      </Grid>
      {isFilterVisible && (
        <Grid item>
          <Paper style={{ marginBottom: 5, padding: 5 }}>
            <ArbitraryFilterComponent
              filter={filter}
              aspects={filterAspects}
              onChange={handleFilterChange}
              helpNameFragment={"Sucht in der Artikel ID und im Namen."}
              handleExpiredToken={handleExpiredToken}
            />
          </Paper>
        </Grid>
      )}
      <Grid item>
        <FilteredRowsDisplay
          all={stockArticleRows}
          filtered={filteredOrderedRows}
        />
      </Grid>
      <Grid item>
        <ErrorDisplays results={errorData} />
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item>
            <Paper style={{ padding: 5 }}>
              <StockArticlesTable
                containerStyle={{ width: "100%", maxWidth: 1200 }}
                data={filteredOrderedRows}
                order={order}
                onOrderChange={setOrder}
                sizeVariant={tableSize}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

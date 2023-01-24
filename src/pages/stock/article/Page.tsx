import {
  FilterAlt,
  FilterAltOff,
  NorthEast,
  SouthWest,
} from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import { sizeVariantForWidth } from "../../../components/table/EmissionsTable";
import { StockArticlesTable } from "../../../components/table/StockArticlesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import {
  ArbitraryFilterComponent,
  FilterAspect,
} from "../../../filter/ArbitraryFilterComponent";
import { ArbitraryFilter } from "../../../filter/Types";
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

const filterAspects: FilterAspect[] = [
  "hashtag",
  "nameFragment",
  "storeSection",
];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [filter, setFilter] = useState<ArbitraryFilter>({});
  const [order, setOrder] = useState<OrderElement<StockArticleRowExt>[]>([
    { field: "articleId", direction: "ascending" },
  ]);
  const [isFilterComponentVisible, setIsFilterComponentVisible] =
    useState(false);

  const handleFilterChange = useCallback(
    (changes: Partial<ArbitraryFilter>) => {
      setFilter((previous) => {
        const newFilter = { ...previous, ...changes };
        return Object.keys(newFilter).find(
          (k) => newFilter[k as keyof typeof newFilter]
        )
          ? newFilter
          : {};
      });
    },
    []
  );

  const handleHideFilterComponent = useCallback(
    () => setIsFilterComponentVisible(false),
    []
  );
  const handleShowFilterComponent = useCallback(
    () => setIsFilterComponentVisible(true),
    []
  );

  const passFilter = useCallback(
    (article: StockArticleRowExt) => {
      const { hashtags, nameFragment, sectionId } = filter;
      if (hashtags) {
        const articleTags = article.hashtags;
        if (
          !articleTags ||
          !hashtags.every((hashtag) => articleTags.includes(hashtag))
        )
          return false;
      }
      if (nameFragment?.length) {
        if (
          article.articleId.indexOf(nameFragment) < 0 &&
          article.name.indexOf(nameFragment) < 0
        )
          return false;
      }
      if (sectionId?.length) {
        if (
          !article.sectionStates.find(
            (state) =>
              (state.physicalCount > 0 || state.availableCount > 0) &&
              state.section.sectionId === sectionId
          )
        ) {
          return false;
        }
      }
      return true;
    },
    [filter]
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
    const filtered = stockArticleRows.filter((row) => passFilter(row));
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
  }, [stockArticleRows, passFilter, order]);

  const filteredRowsDisplay =
    stockArticleRows.length &&
    stockArticleRows.length !== filteredOrderedRows.length
      ? `${filteredOrderedRows.length} Artikel von ${stockArticleRows.length} gefiltert`
      : undefined;

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
    newActions.push({
      label: isFilterComponentVisible ? <FilterAltOff /> : <FilterAlt />,
      tooltip: isFilterComponentVisible
        ? "Filter ausblenden"
        : "Filter einblenden",
      onClick: isFilterComponentVisible
        ? handleHideFilterComponent
        : handleShowFilterComponent,
    });
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
  }, [
    refreshStatus,
    navigate,
    isFilterComponentVisible,
    handleHideFilterComponent,
    handleShowFilterComponent,
  ]);

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
      {isFilterComponentVisible && (
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
      {filteredRowsDisplay && (
        <Grid item>
          <Typography>{filteredRowsDisplay}</Typography>
        </Grid>
      )}
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

import { NorthEast, SouthWest } from "@mui/icons-material";
import { Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { StockChangingRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof StockChangingRow, OrderElement<StockChangingRow>>
> = {
  articleId: { field: "articleId", direction: undefined },
  at: { field: "at", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};
export interface StockChangeTableProps {
  data: StockChangingRow[];
  order?: OrderElement<StockChangingRow>[];
  onOrderChange?: (order: OrderElement<StockChangingRow>[]) => void;
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
}

export const StockChangeTable = (props: StockChangeTableProps) => {
  const { data, order, onOrderChange, sizeVariant, containerStyle } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<
      Record<keyof StockChangingRow, OrderElement<StockChangingRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof StockChangingRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<StockChangingRow>(
        order,
        field
      );
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<StockChangingRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Artikel"
                order={order}
                orderElement={orderElements.articleId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell style={cellStyle} align="right">
              <ColumnLabel
                label="gebucht um"
                order={order}
                orderElement={orderElements.at}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell style={cellStyle} align="right">
              {"Anzahl"}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} align="center">
                {"gebucht von"}
              </TableCell>
            )}
            <TableCell style={cellStyle} align="center">
              {reduceColumns < 2 ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" component={"span"}>
                    {"in"}
                  </Typography>
                  <SouthWest />
                  <Typography variant="body2" component={"span"}>
                    {"out"}
                  </Typography>
                  <NorthEast />
                </div>
              ) : (
                ""
              )}
            </TableCell>
            <TableCell style={cellStyle} align="center">
              {"Lagerbereich"}
            </TableCell>
            {reduceColumns < 1 && (
              <TableCell style={cellStyle} align="center">
                {"Datensatz ID"}
              </TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements]
    );

  const renderDataCells: GenericTableProps<StockChangingRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const { articleId, sectionId, by, count, type, at, datasetId } = row;

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {articleId}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="right">
              {atFormatFunction(at)}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="right">
              {count}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize} align="center">
                {by}
              </TableCell>
            )}
            <TableCell style={cellStyle} size={cellSize} align="center">
              {type === "in" ? <SouthWest /> : <NorthEast />}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="center">
              {sectionId}
            </TableCell>
            {reduceColumns < 1 && (
              <TableCell style={cellStyle} size={cellSize} align="center">
                {datasetId}
              </TableCell>
            )}
          </Fragment>
        );
      },
      [atFormatFunction]
    );

  return (
    <TableContainer style={containerStyle} component={Paper}>
      <GenericTable
        data={data}
        sizeVariant={sizeVariant}
        renderLabelCells={renderLabelCells}
        renderDataCells={renderDataCells}
      />
    </TableContainer>
  );
};

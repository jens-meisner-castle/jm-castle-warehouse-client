import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, useCallback, useMemo } from "react";
import { EmissionRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof EmissionRow, OrderElement<EmissionRow>>
> = {
  articleId: { field: "articleId", direction: undefined },
  emittedAt: { field: "emittedAt", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 550) return "tiny";
  if (width < 750) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface EmissionsTableProps {
  data: EmissionRow[];
  order?: OrderElement<EmissionRow>[];
  onOrderChange?: (order: OrderElement<EmissionRow>[]) => void;
  editable?: boolean;
  onDuplicate?: (row: EmissionRow) => void;
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
}

export const EmissionsTable = (props: EmissionsTableProps) => {
  const {
    data,
    order,
    onOrderChange,
    sizeVariant,
    containerStyle,
    editable,
    onDuplicate,
  } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<
      Record<keyof EmissionRow, OrderElement<EmissionRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof EmissionRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<EmissionRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<EmissionRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <>
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
                orderElement={orderElements.emittedAt}
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
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} align="center">
                {"Lagerbereich"}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell style={cellStyle} align="center">
                {"Datensatz ID"}
              </TableCell>
            )}
          </>
        );
      },
      [handleClickOnOrderElement, order, orderElements]
    );

  const renderDataCells: GenericTableProps<EmissionRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          articleId,
          sectionId,
          byUser,
          articleCount,
          emittedAt,
          datasetId,
        } = row;
        return (
          <>
            <TableCell style={cellStyle} size={cellSize}>
              {articleId}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="right">
              {atFormatFunction(emittedAt)}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="right">
              {articleCount}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize} align="center">
                {byUser}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize} align="center">
                {sectionId}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell style={cellStyle} size={cellSize} align="center">
                {datasetId}
              </TableCell>
            )}
          </>
        );
      },
      [atFormatFunction]
    );

  return (
    <TableContainer style={containerStyle} component={Paper}>
      <GenericTable
        data={data}
        sizeVariant={sizeVariant}
        editable={editable}
        onDuplicate={onDuplicate}
        renderLabelCells={renderLabelCells}
        renderDataCells={renderDataCells}
      />
    </TableContainer>
  );
};

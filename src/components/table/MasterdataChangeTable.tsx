import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { MasterdataChangeRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof MasterdataChangeRow, OrderElement<MasterdataChangeRow>>
> = {
  what: { field: "what", direction: undefined },
  id: { field: "id", direction: undefined },
  editedAt: { field: "editedAt", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};
export interface MasterdataChangeTableProps {
  data: MasterdataChangeRow[];
  order?: OrderElement<MasterdataChangeRow>[];
  onOrderChange?: (order: OrderElement<MasterdataChangeRow>[]) => void;
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
}

export const MasterdataChangeTable = (props: MasterdataChangeTableProps) => {
  const { data, order, onOrderChange, sizeVariant, containerStyle } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<
      Record<keyof MasterdataChangeRow, OrderElement<MasterdataChangeRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof MasterdataChangeRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<MasterdataChangeRow>(
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

  const renderLabelCells: GenericTableProps<MasterdataChangeRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Was"
                order={order}
                orderElement={orderElements.what}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell style={cellStyle} align="center">
              <ColumnLabel
                label="ID"
                align="center"
                order={order}
                orderElement={orderElements.id}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell style={cellStyle} align="center">
              <ColumnLabel
                label="geändert um"
                align="center"
                order={order}
                orderElement={orderElements.editedAt}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements]
    );

  const renderDataCells: GenericTableProps<MasterdataChangeRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const { id, what, editedAt } = row;

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {what}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize}>
              {id}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="center">
              {atFormatFunction(editedAt)}
            </TableCell>
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

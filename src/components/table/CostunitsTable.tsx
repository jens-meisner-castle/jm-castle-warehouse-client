import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { CostunitRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof CostunitRow, OrderElement<CostunitRow>>
> = {
  name: { field: "name", direction: undefined },
  unitId: { field: "unitId", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface CostunitsTableProps {
  data: CostunitRow[];
  order?: OrderElement<CostunitRow>[];
  onOrderChange?: (order: OrderElement<CostunitRow>[]) => void;
  editable?: boolean;
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: CostunitRow) => void;
  onDuplicate?: (row: CostunitRow) => void;
}

export const CostunitsTable = (props: CostunitsTableProps) => {
  const {
    data,
    order,
    onOrderChange,
    sizeVariant,
    containerStyle,
    editable,
    onEdit,
    onDuplicate,
  } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<
      Record<keyof CostunitRow, OrderElement<CostunitRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof CostunitRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<CostunitRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<CostunitsTableProps>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Costunit"
                order={order}
                orderElement={orderElements.unitId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Name"
                order={order}
                orderElement={orderElements.name}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"erzeugt"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"bearbeitet"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} align="right">
                {"Version"}
              </TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements]
    );

  const renderDataCells: GenericTableProps<CostunitRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const { unitId, name, datasetVersion, createdAt, editedAt } = row;

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {unitId}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize}>
              {name}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} align="center" size={cellSize}>
                {atFormatFunction(createdAt)}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell align="center" style={cellStyle} size={cellSize}>
                {createdAt.getTime() === editedAt.getTime()
                  ? "-"
                  : atFormatFunction(editedAt)}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell align="right" style={cellStyle} size={cellSize}>
                {datasetVersion}
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
        editable={editable}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        sizeVariant={sizeVariant}
        renderDataCells={renderDataCells}
        renderLabelCells={renderLabelCells}
      />
    </TableContainer>
  );
};

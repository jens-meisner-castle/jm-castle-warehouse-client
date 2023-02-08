import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { ManufacturerRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof ManufacturerRow, OrderElement<ManufacturerRow>>
> = {
  name: { field: "name", direction: undefined },
  manufacturerId: { field: "manufacturerId", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface ManufacturersTableProps {
  data: ManufacturerRow[];
  order?: OrderElement<ManufacturerRow>[];
  onOrderChange?: (order: OrderElement<ManufacturerRow>[]) => void;
  editable?: boolean;
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: ManufacturerRow) => void;
  onDuplicate?: (row: ManufacturerRow) => void;
}

export const ManufacturersTable = (props: ManufacturersTableProps) => {
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
      Record<keyof ManufacturerRow, OrderElement<ManufacturerRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof ManufacturerRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<ManufacturerRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<ManufacturerRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Empfänger"
                order={order}
                orderElement={orderElements.manufacturerId}
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

  const renderDataCells: GenericTableProps<ManufacturerRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const { manufacturerId, name, datasetVersion, createdAt, editedAt } =
          row;

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {manufacturerId}
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
            <TableCell align="right" style={cellStyle} size={cellSize}>
              {datasetVersion}
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
        editable={editable}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        sizeVariant={sizeVariant}
        renderLabelCells={renderLabelCells}
        renderDataCells={renderDataCells}
      />
    </TableContainer>
  );
};

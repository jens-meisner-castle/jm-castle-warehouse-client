import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { StoreRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof StoreRow, OrderElement<StoreRow>>
> = {
  name: { field: "name", direction: undefined },
  storeId: { field: "storeId", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface StoresTableProps {
  data: StoreRow[];
  order?: OrderElement<StoreRow>[];
  onOrderChange?: (order: OrderElement<StoreRow>[]) => void;
  editable?: boolean;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: StoreRow) => void;
  onDuplicate?: (row: StoreRow) => void;
}

export const StoresTable = (props: StoresTableProps) => {
  const {
    data,
    order,
    onOrderChange,
    sizeVariant,
    containerStyle,
    editable,
    onEdit,
    onDuplicate,
    displayImage,
  } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<Record<keyof StoreRow, OrderElement<StoreRow>>> = {
      ...availableOrderElements,
    };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof StoreRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<StoreRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<StoreRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Lager"
                order={order}
                orderElement={orderElements.storeId}
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
            <TableCell style={cellStyle} align="right">
              {"Version"}
            </TableCell>
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Bilder"}</TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements, displayImage]
    );

  const renderDataCells: GenericTableProps<StoreRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          storeId,
          name,
          datasetVersion,
          createdAt,
          editedAt,
          imageRefs,
        } = row;
        const imageUrl = getImageDisplayUrl(
          backendApiUrl,
          imageRefs ? imageRefs[0] : undefined
        );

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {storeId}
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
            {displayImage === "small" && (
              <TableCell align="right" style={cellStyle} size={cellSize}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    width={displayImage === "small" ? 50 : 0}
                    height="auto"
                  />
                ) : (
                  "-"
                )}
              </TableCell>
            )}
          </Fragment>
        );
      },
      [atFormatFunction, displayImage]
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

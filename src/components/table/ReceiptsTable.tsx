import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { ReceiptRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof ReceiptRow, OrderElement<ReceiptRow>>
> = {
  articleId: { field: "articleId", direction: undefined },
  receiptAt: { field: "receiptAt", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 550) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface ReceiptsTableProps {
  data: ReceiptRow[];
  order?: OrderElement<ReceiptRow>[];
  onOrderChange?: (order: OrderElement<ReceiptRow>[]) => void;
  editable?: boolean;
  onDuplicate?: (row: ReceiptRow) => void;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
}

export const ReceiptsTable = (props: ReceiptsTableProps) => {
  const {
    data,
    order,
    onOrderChange,
    containerStyle,
    editable,
    onDuplicate,
    displayImage,
    sizeVariant,
  } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<Record<keyof ReceiptRow, OrderElement<ReceiptRow>>> =
      { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof ReceiptRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<ReceiptRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<ReceiptRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <>
            <TableCell>
              <ColumnLabel
                label="Artikel"
                order={order}
                orderElement={orderElements.articleId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnLabel
                label="gebucht um"
                order={order}
                orderElement={orderElements.receiptAt}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell align="right">{"Anzahl"}</TableCell>
            {reduceColumns < 1 && (
              <TableCell align="center">{"gebucht von"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell align="center">{"Lagerbereich"}</TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell align="center">{"Datensatz ID"}</TableCell>
            )}
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Bilder"}</TableCell>
            )}
          </>
        );
      },
      [handleClickOnOrderElement, order, orderElements, displayImage]
    );

  const renderDataCells: GenericTableProps<ReceiptRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          articleId,
          sectionId,
          byUser,
          articleCount,
          receiptAt,
          datasetId,
          imageRefs,
        } = row;
        const imageUrl = getImageDisplayUrl(
          backendApiUrl,
          imageRefs ? imageRefs[0] : undefined
        );

        return (
          <>
            <TableCell style={cellStyle} size={cellSize}>
              {articleId}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="right">
              {atFormatFunction(receiptAt)}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize} align="right">
              {articleCount}
            </TableCell>
            {reduceColumns < 1 && (
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
          </>
        );
      },
      [atFormatFunction, displayImage]
    );

  return (
    <TableContainer style={containerStyle} component={Paper}>
      <GenericTable
        data={data}
        editable={editable}
        onDuplicate={onDuplicate}
        sizeVariant={sizeVariant}
        renderLabelCells={renderLabelCells}
        renderDataCells={renderDataCells}
      />
    </TableContainer>
  );
};

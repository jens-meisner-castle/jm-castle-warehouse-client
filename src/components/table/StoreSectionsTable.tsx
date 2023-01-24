import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { StoreSectionRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof StoreSectionRow, OrderElement<StoreSectionRow>>
> = {
  name: { field: "name", direction: undefined },
  sectionId: { field: "sectionId", direction: undefined },
  storeId: { field: "storeId", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 550) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface StoreSectionsTableProps {
  data: StoreSectionRow[];
  order?: OrderElement<StoreSectionRow>[];
  onOrderChange?: (order: OrderElement<StoreSectionRow>[]) => void;
  editable?: boolean;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: StoreSectionRow) => void;
  onDuplicate?: (row: StoreSectionRow) => void;
  onShowQrCode?: (row: StoreSectionRow) => void;
}

export const StoreSectionsTable = (props: StoreSectionsTableProps) => {
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
    onShowQrCode,
  } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<
      Record<keyof StoreSectionRow, OrderElement<StoreSectionRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof StoreSectionRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<StoreSectionRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<StoreSectionRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Bereich"
                order={order}
                orderElement={orderElements.sectionId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"Name"}</TableCell>
            )}
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Lager"
                order={order}
                orderElement={orderElements.storeId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            {reduceColumns < 1 && (
              <TableCell style={cellStyle}>{"erzeugt"}</TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell style={cellStyle}>{"bearbeitet"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} align="right">
                {"Version"}
              </TableCell>
            )}
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Bilder"}</TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements, displayImage]
    );

  const renderDataCells: GenericTableProps<StoreSectionRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          sectionId,
          storeId,
          name,
          imageRefs,
          datasetVersion,
          createdAt,
          editedAt,
        } = row;
        const imageUrl = getImageDisplayUrl(
          backendApiUrl,
          imageRefs ? imageRefs[0] : undefined
        );

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {sectionId}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize}>
                {name}
              </TableCell>
            )}
            <TableCell style={cellStyle} size={cellSize}>
              {storeId}
            </TableCell>
            {reduceColumns < 1 && (
              <TableCell style={cellStyle} size={cellSize}>
                {atFormatFunction(createdAt)}
              </TableCell>
            )}
            {reduceColumns < 1 && (
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
        onShowQrCode={onShowQrCode}
        sizeVariant={sizeVariant}
        renderLabelCells={renderLabelCells}
        renderDataCells={renderDataCells}
      />
    </TableContainer>
  );
};

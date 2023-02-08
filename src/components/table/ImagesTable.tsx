import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { ImageContentRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof ImageContentRow, OrderElement<ImageContentRow>>
> = {
  imageId: { field: "imageId", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface ImagesTableProps {
  data: ImageContentRow[];
  order?: OrderElement<ImageContentRow>[];
  onOrderChange?: (order: OrderElement<ImageContentRow>[]) => void;
  editable?: boolean;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: ImageContentRow) => void;
  onDuplicate?: (row: ImageContentRow) => void;
}

export const ImagesTable = (props: ImagesTableProps) => {
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
    const newHash: Partial<
      Record<keyof ImageContentRow, OrderElement<ImageContentRow>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof ImageContentRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<ImageContentRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<ImageContentRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell style={cellStyle}>
              <ColumnLabel
                label="Bild ID"
                order={order}
                orderElement={orderElements.imageId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"Dateiendung"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"Dateigröße (bytes)"}</TableCell>
            )}
            <TableCell style={cellStyle}>{"Breite"}</TableCell>
            <TableCell style={cellStyle}>{"Höhe"}</TableCell>
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
              <TableCell style={cellStyle}>{"Bild"}</TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements, displayImage]
    );

  const renderDataCells: GenericTableProps<ImageContentRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          imageId,
          imageExtension,
          sizeInBytes,
          width,
          height,
          datasetVersion,
          createdAt,
          editedAt,
        } = row;
        const imageUrl = getImageDisplayUrl(
          backendApiUrl,
          imageId,
          datasetVersion
        );

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {imageId}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize}>
                {imageExtension}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize}>
                {sizeInBytes}
              </TableCell>
            )}
            <TableCell style={cellStyle} size={cellSize}>
              {width}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize}>
              {height}
            </TableCell>
            {reduceColumns < 1 && (
              <TableCell style={cellStyle} align="center" size={cellSize}>
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
            <TableCell align="right" style={cellStyle} size={cellSize}>
              {displayImage === "small" && imageUrl ? (
                <img
                  src={imageUrl}
                  width={displayImage === "small" ? 50 : 0}
                  height="auto"
                />
              ) : (
                "-"
              )}
            </TableCell>
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
        renderDataCells={renderDataCells}
        renderLabelCells={renderLabelCells}
      />
    </TableContainer>
  );
};

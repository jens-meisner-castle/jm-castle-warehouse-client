import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { WwwLink } from "../../navigation/WwwLink";
import { ArticleRow } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { getDateFormat, getDateFormatter } from "../../utils/Format";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof ArticleRow, OrderElement<ArticleRow>>
> = {
  name: { field: "name", direction: undefined },
  articleId: { field: "articleId", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface ArticlesTableProps {
  data: ArticleRow[];
  order?: OrderElement<ArticleRow>[];
  onOrderChange?: (order: OrderElement<ArticleRow>[]) => void;
  editable?: boolean;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: ArticleRow) => void;
  onDuplicate?: (row: ArticleRow) => void;
}

export const ArticlesTable = (props: ArticlesTableProps) => {
  const {
    data,
    order,
    onOrderChange,
    containerStyle,
    editable,
    onEdit,
    onDuplicate,
    displayImage,
    sizeVariant,
  } = props;

  const orderElements = useMemo(() => {
    const newHash: Partial<Record<keyof ArticleRow, OrderElement<ArticleRow>>> =
      { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const handleClickOnOrderElement = useCallback(
    (field: keyof ArticleRow) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<ArticleRow>(order, field);
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  const renderLabelCells: GenericTableProps<ArticleRow>["renderLabelCells"] =
    useCallback(
      (reduceColumns, cellStyle) => {
        return (
          <Fragment key="labelCells">
            <TableCell key={"article"} style={cellStyle}>
              <ColumnLabel
                label="Artikel"
                order={order}
                orderElement={orderElements.articleId}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell key={"name"} style={cellStyle}>
                <ColumnLabel
                  label="Name"
                  order={order}
                  orderElement={orderElements.name}
                  onClick={handleClickOnOrderElement}
                />
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell key={"link"} style={cellStyle}>
                {"Link (www)"}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell key={"countUnit"} style={cellStyle}>
                {"Zähleinheit"}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell key={"hashtag"} style={cellStyle}>
                {"Hashtags"}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell key={"createdAt"} style={cellStyle}>
                {"erzeugt"}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell key={"editedAt"} style={cellStyle}>
                {"bearbeitet"}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell key={"version"} style={cellStyle} align="right">
                {"Version"}
              </TableCell>
            )}
            {displayImage === "small" && (
              <TableCell key={"image"} style={cellStyle}>
                {"Bilder"}
              </TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements, displayImage]
    );

  const renderDataCells: GenericTableProps<ArticleRow>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          articleId,
          imageRefs,
          name,
          countUnit,
          hashtags,
          wwwLink,
          datasetVersion,
          createdAt,
          editedAt,
        } = row;
        const wwwLinkUrl = wwwLink ? new URL(wwwLink) : undefined;
        const imageUrl = getImageDisplayUrl(
          backendApiUrl,
          imageRefs ? imageRefs[0] : undefined
        );
        return (
          <Fragment key={"dataCells"}>
            <TableCell key={"article"} style={cellStyle} size={cellSize}>
              {articleId}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell key={"name"} style={cellStyle} size={cellSize}>
                {name}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell key={"link"} style={cellStyle} size={cellSize}>
                {wwwLinkUrl && wwwLink && (
                  <WwwLink
                    to={wwwLink}
                    label={wwwLinkUrl.host}
                    variant="body2"
                  />
                )}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell key={"countUnit"} style={cellStyle} size={cellSize}>
                {countUnit}
              </TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell key={"hashtag"} style={cellStyle} size={cellSize}>
                {hashtags ? hashtags.join(", ") : ""}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell key={"createdAt"} style={cellStyle} size={cellSize}>
                {atFormatFunction(createdAt)}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell
                key={"editedAt"}
                align="center"
                style={cellStyle}
                size={cellSize}
              >
                {createdAt.getTime() === editedAt.getTime()
                  ? "-"
                  : atFormatFunction(editedAt)}
              </TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell
                key={"version"}
                align="right"
                style={cellStyle}
                size={cellSize}
              >
                {datasetVersion}
              </TableCell>
            )}
            {displayImage === "small" && (
              <TableCell
                key={"image"}
                align="right"
                style={cellStyle}
                size={cellSize}
              >
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

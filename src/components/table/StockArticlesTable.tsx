import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { CountUnits } from "jm-castle-warehouse-types/build";
import { CSSProperties, Fragment, useCallback, useMemo } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { WwwLink } from "../../navigation/WwwLink";
import { ArticleRow, StockArticleRowExt } from "../../types/RowTypes";
import { newOrderForChangedElement, OrderElement } from "../../types/Types";
import { SizeVariant } from "../SizeVariant";
import { ColumnLabel } from "./ColumnLabel";
import { GenericTable, GenericTableProps } from "./GenericTable";

export const availableOrderElements: Partial<
  Record<keyof StockArticleRowExt, OrderElement<StockArticleRowExt>>
> = {
  name: { field: "name", direction: undefined },
  articleId: { field: "articleId", direction: undefined },
  physicalCount: { field: "physicalCount", direction: undefined },
  availableCount: { field: "availableCount", direction: undefined },
};

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface StockArticlesTableProps {
  data: StockArticleRowExt[];
  order?: OrderElement<StockArticleRowExt>[];
  onOrderChange?: (order: OrderElement<StockArticleRowExt>[]) => void;
  editable?: boolean;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: ArticleRow) => void;
  onDuplicate?: (row: ArticleRow) => void;
}

export const StockArticlesTable = (props: StockArticlesTableProps) => {
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

  const handleClickOnOrderElement = useCallback(
    (field: keyof StockArticleRowExt) => {
      if (!onOrderChange || !order) return;
      const newOrder = newOrderForChangedElement<StockArticleRowExt>(
        order,
        field
      );
      onOrderChange(newOrder);
    },
    [order, onOrderChange]
  );

  const orderElements = useMemo(() => {
    const newHash: Partial<
      Record<keyof StockArticleRowExt, OrderElement<StockArticleRowExt>>
    > = { ...availableOrderElements };
    order?.forEach((e) => (newHash[e.field] = e));
    return newHash;
  }, [order]);

  const renderLabelCells: GenericTableProps<StockArticleRowExt>["renderLabelCells"] =
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
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>
                <ColumnLabel
                  label="Name"
                  order={order}
                  orderElement={orderElements.name}
                  onClick={handleClickOnOrderElement}
                />
              </TableCell>
            )}
            <TableCell align="center" style={cellStyle}>
              <ColumnLabel
                label="Lager"
                order={order}
                orderElement={orderElements.physicalCount}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell align="center" style={cellStyle}>
              <ColumnLabel
                label="verfügbar"
                order={order}
                orderElement={orderElements.availableCount}
                onClick={handleClickOnOrderElement}
              />
            </TableCell>
            <TableCell align="center" style={cellStyle}>
              {"Einheit"}
            </TableCell>
            <TableCell align="center" style={cellStyle}>
              {"in Lagerbereich"}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"Link (www)"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"Hashtags"}</TableCell>
            )}
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Bilder"}</TableCell>
            )}
          </Fragment>
        );
      },
      [handleClickOnOrderElement, order, orderElements, displayImage]
    );

  const renderDataCells: GenericTableProps<StockArticleRowExt>["renderDataCells"] =
    useCallback(
      (row, reduceColumns, cellStyle, cellSize) => {
        const {
          articleId,
          imageRefs,
          name,
          countUnit,
          hashtags,
          wwwLink,
          physicalCount,
          availableCount,
          sectionsWithCount,
        } = row;
        const wwwLinkUrl = wwwLink ? new URL(wwwLink) : undefined;
        const imageUrl = getImageDisplayUrl(
          backendApiUrl,
          imageRefs ? imageRefs[0] : undefined
        );

        return (
          <Fragment key="dataCells">
            <TableCell style={cellStyle} size={cellSize}>
              {articleId}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize}>
                {name}
              </TableCell>
            )}
            <TableCell align="center" style={cellStyle} size={cellSize}>
              {`${physicalCount}`}
            </TableCell>
            <TableCell align="center" style={cellStyle} size={cellSize}>
              {`${availableCount}`}
            </TableCell>
            <TableCell style={cellStyle} size={cellSize}>
              {CountUnits[countUnit]?.name}
            </TableCell>
            <TableCell align="center" style={cellStyle} size={cellSize}>
              {sectionsWithCount.length
                ? sectionsWithCount
                    .map((section) => section.sectionId)
                    .join(", ")
                : ""}
            </TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle} size={cellSize}>
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
              <TableCell style={cellStyle} size={cellSize}>
                {hashtags ? hashtags.join(", ") : ""}
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
      [displayImage]
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

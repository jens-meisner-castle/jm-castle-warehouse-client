import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination, {
  TablePaginationProps,
} from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { backendApiUrl, getImageDisplayUrl } from "../configuration/Urls";
import { ArticleRow } from "../types/RowTypes";
import { getDateFormat, getDateFormatter } from "../utils/Format";
import { TablePaginationActions } from "./TablePaginationActions";

interface TableSettings {
  rowsPerPage: number;
}

export interface ArticlesTableProps {
  data: ArticleRow[];
  editable?: boolean;
  displayImage?: "small" | "none";
  cellSize?: "small" | "medium";
  containerStyle?: CSSProperties;
  onEdit?: (row: ArticleRow) => void;
  onDuplicate?: (row: ArticleRow) => void;
}

export const ArticlesTable = (props: ArticlesTableProps) => {
  const {
    data,
    cellSize,
    containerStyle,
    editable,
    onEdit,
    onDuplicate,
    displayImage,
  } = props;
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    rowsPerPage: 20,
  });
  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);
  const { rowsPerPage } = tableSettings;
  const maxPage = Math.max(0, Math.ceil(data.length / rowsPerPage) - 1);
  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage((previous) => {
      return Math.min(previous, maxPage);
    });
  }, [maxPage, rowsPerPage]);
  const usedPage = Math.min(page, maxPage);
  const visibleRows = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handlePageChange: TablePaginationProps["onPageChange"] = (
    event,
    newPage
  ) => setPage(newPage);
  const handleRowsPerPageChange: TablePaginationProps["onRowsPerPageChange"] = (
    event
  ) =>
    setTableSettings((previous) => ({
      ...previous,
      rowsPerPage: parseInt(event.target.value),
    }));
  const cellStyle: CSSProperties | undefined =
    cellSize === "small"
      ? { padding: 2 }
      : cellSize === "medium"
      ? { padding: 6 }
      : undefined;

  return (
    <TableContainer style={containerStyle} component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[
                10,
                20,
                30,
                40,
                50,
                { label: "All", value: -1 },
              ]}
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={usedPage}
              SelectProps={{
                inputProps: {
                  "aria-label": "rows per page",
                },
                native: true,
              }}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
          <TableRow>
            {editable && (
              <TableCell style={cellStyle} align="center">
                {""}
              </TableCell>
            )}
            {editable && (
              <TableCell style={cellStyle} align="center">
                {""}
              </TableCell>
            )}
            <TableCell style={cellStyle}>{"Artikel"}</TableCell>
            <TableCell style={cellStyle}>{"Name"}</TableCell>
            <TableCell style={cellStyle}>{"Zähleinheit"}</TableCell>
            <TableCell style={cellStyle}>{"erzeugt"}</TableCell>
            <TableCell style={cellStyle}>{"bearbeitet"}</TableCell>
            <TableCell style={cellStyle} align="right">
              {"Version"}
            </TableCell>
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Artikelbild"}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((d, i) => {
            const {
              articleId,
              articleImgRef,
              name,
              countUnit,
              datasetVersion,
              createdAt,
              editedAt,
            } = d;
            const imageUrl = getImageDisplayUrl(backendApiUrl, articleImgRef);

            return (
              <TableRow key={i}>
                {editable && (
                  <TableCell align="center" style={cellStyle}>
                    {
                      <IconButton onClick={() => onDuplicate && onDuplicate(d)}>
                        <ContentCopyIcon />
                      </IconButton>
                    }
                  </TableCell>
                )}
                {editable && (
                  <TableCell align="center" style={cellStyle}>
                    {
                      <IconButton onClick={() => onEdit && onEdit(d)}>
                        <EditIcon />
                      </IconButton>
                    }
                  </TableCell>
                )}
                <TableCell style={cellStyle} size={cellSize}>
                  {articleId}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize}>
                  {name}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize}>
                  {countUnit}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize}>
                  {atFormatFunction(createdAt)}
                </TableCell>
                <TableCell align="center" style={cellStyle} size={cellSize}>
                  {createdAt.getTime() === editedAt.getTime()
                    ? "-"
                    : atFormatFunction(editedAt)}
                </TableCell>
                <TableCell align="right" style={cellStyle} size={cellSize}>
                  {datasetVersion}
                </TableCell>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

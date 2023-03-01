import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { IconButton, Tooltip } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { TableCellProps } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination, {
  TablePaginationProps,
} from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { CSSProperties, ReactNode, useEffect, useMemo, useState } from "react";
import { SizeVariant } from "../SizeVariant";
import { TablePaginationActions } from "./TablePaginationActions";
import { labelRowsPerPage } from "./Utils";

export interface TableSettings {
  rowsPerPage: number;
}

export interface GenericTableProps<T> {
  data: T[];
  renderDataCells: (
    row: T,
    reduceColumns: 0 | 1 | 2,
    cellStyle: CSSProperties,
    cellSize: TableCellProps["size"]
  ) => ReactNode;
  renderLabelCells: (
    reduceColumns: 0 | 1 | 2,
    cellStyle: CSSProperties
  ) => ReactNode;
  editable?: boolean;
  sizeVariant: SizeVariant;
  hidePagination?: boolean;
  onEdit?: (row: T) => void;
  onDuplicate?: (row: T) => void;
  onShowQrCode?: (row: T) => void;
}

export const GenericTable = <T,>(props: GenericTableProps<T>) => {
  const {
    data,
    renderDataCells,
    renderLabelCells,
    editable,
    onEdit,
    onDuplicate,
    onShowQrCode,
    sizeVariant,
    hidePagination,
  } = props;
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    rowsPerPage: 20,
  });
  const [page, setPage] = useState(0);

  // 0 = alle Spalten; 1 = einige Spalten weglassen; 2 = alle nicht unbedingt notwendigen Spalten weglassen
  const reduceColumns: 0 | 1 | 2 =
    sizeVariant === "tiny" ? 2 : sizeVariant === "small" ? 1 : 0;

  const cellSize: TableCellProps["size"] =
    sizeVariant === "large" ? "medium" : "small";

  const cellStyle: CSSProperties = useMemo(
    () =>
      cellSize === "small"
        ? { padding: 2 }
        : { padding: 6, paddingTop: 2, paddingBottom: 2 },
    [cellSize]
  );

  const { rowsPerPage } = tableSettings;

  const maxPage = Math.max(0, Math.ceil(data.length / rowsPerPage) - 1);

  useEffect(() => {
    setPage((previous) => {
      return Math.min(previous, maxPage);
    });
  }, [maxPage, rowsPerPage]);
  const usedPage = Math.min(page, maxPage);

  const visibleRows = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, data]
  );

  const labelCells = useMemo(() => {
    const cells: ReactNode[] = [];
    editable &&
      onDuplicate &&
      cells.push(
        <TableCell key={"duplicate"} style={cellStyle} align="center">
          {""}
        </TableCell>
      );
    editable &&
      onEdit &&
      cells.push(
        <TableCell key={"edit"} style={cellStyle} align="center">
          {""}
        </TableCell>
      );
    cells.push(renderLabelCells(reduceColumns, cellStyle));
    onShowQrCode &&
      cells.push(
        <TableCell key={"qrCode"} style={cellStyle} align="center">
          {""}
        </TableCell>
      );
    return cells;
  }, [
    reduceColumns,
    cellStyle,
    editable,
    onDuplicate,
    onEdit,
    onShowQrCode,
    renderLabelCells,
  ]);

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

  return (
    <Table>
      <TableHead>
        {!hidePagination && (
          <TableRow>
            <TablePagination
              labelRowsPerPage={labelRowsPerPage(sizeVariant)}
              style={{ paddingLeft: sizeVariant === "tiny" ? 2 : undefined }}
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
        )}
        <TableRow>{labelCells}</TableRow>
      </TableHead>
      <TableBody>
        {visibleRows.map((row, i) => {
          const cells: ReactNode[] = [];
          editable &&
            onDuplicate &&
            cells.push(
              <TableCell key={"duplicate"} align="center" style={cellStyle}>
                {
                  <IconButton onClick={() => onDuplicate(row)}>
                    <Tooltip title="Datensatz duplizieren">
                      <ContentCopyIcon />
                    </Tooltip>
                  </IconButton>
                }
              </TableCell>
            );
          editable &&
            onEdit &&
            cells.push(
              <TableCell key={"edit"} align="center" style={cellStyle}>
                {
                  <IconButton onClick={() => onEdit(row)}>
                    <Tooltip title="Datensatz bearbeiten">
                      <EditIcon />
                    </Tooltip>
                  </IconButton>
                }
              </TableCell>
            );
          cells.push(renderDataCells(row, reduceColumns, cellStyle, cellSize));
          onShowQrCode &&
            cells.push(
              <TableCell key={"qrCode"} align="center" style={cellStyle}>
                {
                  <IconButton onClick={() => onShowQrCode(row)}>
                    <Tooltip title="QR Code anzeigen">
                      <QrCode2Icon />
                    </Tooltip>
                  </IconButton>
                }
              </TableCell>
            );
          return <TableRow key={i}>{cells}</TableRow>;
        })}
      </TableBody>
    </Table>
  );
};

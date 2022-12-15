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
import { StoreRow } from "../types/RowTypes";
import { getDateFormat, getDateFormatter } from "../utils/Format";
import { TablePaginationActions } from "./TablePaginationActions";

interface TableSettings {
  rowsPerPage: number;
}

export interface StoresTableProps {
  data: StoreRow[];
  editable?: boolean;
  cellSize?: "small" | "medium";
  containerStyle?: CSSProperties;
  onEdit?: (row: StoreRow) => void;
}

export const StoresTable = (props: StoresTableProps) => {
  const { data, cellSize, containerStyle, editable, onEdit } = props;
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
                {"Bearbeiten"}
              </TableCell>
            )}
            <TableCell style={cellStyle}>{"Lager"}</TableCell>
            <TableCell style={cellStyle}>{"Name"}</TableCell>
            <TableCell style={cellStyle}>{"erzeugt"}</TableCell>
            <TableCell style={cellStyle}>{"bearbeitet"}</TableCell>
            <TableCell style={cellStyle} align="right">
              {"Version"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((d, i) => {
            const { storeId, name, datasetVersion, createdAt, editedAt } = d;

            return (
              <TableRow key={i}>
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
                  {storeId}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize}>
                  {name}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

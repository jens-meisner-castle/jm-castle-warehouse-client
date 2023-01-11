import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
import { EmissionRow } from "../types/RowTypes";
import { getDateFormat, getDateFormatter } from "../utils/Format";
import { SizeVariant } from "./SizeVariant";
import { TablePaginationActions } from "./TablePaginationActions";

interface TableSettings {
  rowsPerPage: number;
}

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 550) return "tiny";
  if (width < 750) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface EmissionsTableProps {
  data: EmissionRow[];
  editable?: boolean;
  onDuplicate?: (row: EmissionRow) => void;
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
}

export const EmissionsTable = (props: EmissionsTableProps) => {
  const { data, sizeVariant, containerStyle, editable, onDuplicate } = props;
  // 0 = alle Spalten; 1 = einige Spalten weglassen; 2 = alle nicht unbedingt notwendigen Spalten weglassen
  const reduceColumns: 0 | 1 | 2 =
    sizeVariant === "tiny" ? 2 : sizeVariant === "small" ? 1 : 0;
  const labelRowsPerPage =
    sizeVariant === "tiny"
      ? ""
      : sizeVariant === "small"
      ? "Zeilen"
      : "Zeilen pro Seite";
  const cellSize = sizeVariant === "large" ? "medium" : "small";
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    rowsPerPage: 20,
  });
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
    cellSize === "small" ? { padding: 2 } : undefined;

  const atFormatFunction = useMemo(() => {
    const atFormat = getDateFormat("minute");
    return getDateFormatter({ format: atFormat });
  }, []);

  return (
    <TableContainer style={containerStyle} component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TablePagination
              labelRowsPerPage={labelRowsPerPage}
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
            {editable && onDuplicate && (
              <TableCell style={cellStyle} align="center">
                {""}
              </TableCell>
            )}
            <TableCell>{"Artikel"}</TableCell>
            <TableCell align="right">{"gebucht um"}</TableCell>
            <TableCell align="right">{"Anzahl"}</TableCell>
            {reduceColumns < 2 && (
              <TableCell align="center">{"gebucht von"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell align="center">{"Lagerbereich"}</TableCell>
            )}
            {reduceColumns < 1 && (
              <TableCell align="center">{"Datensatz ID"}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((d, i) => {
            const {
              articleId,
              sectionId,
              byUser,
              articleCount,
              emittedAt,
              datasetId,
            } = d;

            return (
              <TableRow key={i}>
                {editable && onDuplicate && (
                  <TableCell align="center" style={cellStyle}>
                    {
                      <IconButton onClick={() => onDuplicate(d)}>
                        <ContentCopyIcon />
                      </IconButton>
                    }
                  </TableCell>
                )}
                <TableCell style={cellStyle} size={cellSize}>
                  {articleId}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize} align="right">
                  {atFormatFunction(emittedAt)}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize} align="right">
                  {articleCount}
                </TableCell>
                {reduceColumns < 2 && (
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

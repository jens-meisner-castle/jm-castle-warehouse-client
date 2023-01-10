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
import { backendApiUrl, getImageDisplayUrl } from "../configuration/Urls";
import { ReceiptRow } from "../types/RowTypes";
import { getDateFormat, getDateFormatter } from "../utils/Format";
import { TablePaginationActions } from "./TablePaginationActions";

interface TableSettings {
  rowsPerPage: number;
}

export interface ReceiptsTableProps {
  data: ReceiptRow[];
  editable?: boolean;
  onDuplicate?: (row: ReceiptRow) => void;
  displayImage?: "small" | "none";
  cellSize?: "small" | "medium";
  containerStyle?: CSSProperties;
}

export const ReceiptsTable = (props: ReceiptsTableProps) => {
  const {
    data,
    cellSize,
    containerStyle,
    editable,
    onDuplicate,
    displayImage,
  } = props;
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
            <TableCell align="center">{"gebucht von"}</TableCell>
            <TableCell align="center">{"Lagerbereich"}</TableCell>
            <TableCell align="center">{"Datensatz ID"}</TableCell>
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Bilder"}</TableCell>
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
              receiptAt,
              datasetId,
              imageRefs,
            } = d;
            const imageUrl = getImageDisplayUrl(
              backendApiUrl,
              imageRefs ? imageRefs[0] : undefined
            );

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
                  {atFormatFunction(receiptAt)}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize} align="right">
                  {articleCount}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize} align="center">
                  {byUser}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize} align="center">
                  {sectionId}
                </TableCell>
                <TableCell style={cellStyle} size={cellSize} align="center">
                  {datasetId}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

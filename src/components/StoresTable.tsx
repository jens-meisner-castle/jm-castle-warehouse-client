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
import { StoreRow } from "../types/RowTypes";
import { getDateFormat, getDateFormatter } from "../utils/Format";
import { SizeVariant } from "./SizeVariant";
import { TablePaginationActions } from "./TablePaginationActions";

interface TableSettings {
  rowsPerPage: number;
}

export const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export interface StoresTableProps {
  data: StoreRow[];
  editable?: boolean;
  displayImage?: "small" | "none";
  sizeVariant: SizeVariant;
  containerStyle?: CSSProperties;
  onEdit?: (row: StoreRow) => void;
  onDuplicate?: (row: StoreRow) => void;
}

export const StoresTable = (props: StoresTableProps) => {
  const {
    data,
    sizeVariant,
    containerStyle,
    editable,
    onEdit,
    onDuplicate,
    displayImage,
  } = props;

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
            {editable && onEdit && (
              <TableCell style={cellStyle} align="center">
                {""}
              </TableCell>
            )}
            <TableCell style={cellStyle}>{"Lager"}</TableCell>
            <TableCell style={cellStyle}>{"Name"}</TableCell>
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"erzeugt"}</TableCell>
            )}
            {reduceColumns < 2 && (
              <TableCell style={cellStyle}>{"bearbeitet"}</TableCell>
            )}
            <TableCell style={cellStyle} align="right">
              {"Version"}
            </TableCell>
            {displayImage === "small" && (
              <TableCell style={cellStyle}>{"Bilder"}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((d, i) => {
            const {
              storeId,
              name,
              datasetVersion,
              createdAt,
              editedAt,
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
                {reduceColumns < 2 && (
                  <TableCell style={cellStyle} size={cellSize}>
                    {atFormatFunction(createdAt)}
                  </TableCell>
                )}
                {reduceColumns < 2 && (
                  <TableCell align="center" style={cellStyle} size={cellSize}>
                    {createdAt.getTime() === editedAt.getTime()
                      ? "-"
                      : atFormatFunction(editedAt)}
                  </TableCell>
                )}
                <TableCell align="right" style={cellStyle} size={cellSize}>
                  {datasetVersion}
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

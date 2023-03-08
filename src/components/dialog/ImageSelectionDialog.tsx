import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TablePagination,
  TablePaginationProps,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { backendApiUrl, getImageDisplayUrl } from "../../configuration/Urls";
import { useMasterdata } from "../../hooks/pagination/useMasterdata";
import { ErrorDisplays } from "../ErrorDisplays";
import { TableSettings } from "../table/GenericTable";
import { TablePaginationActions } from "../table/TablePaginationActions";

export interface ImageSelectionDialogProps {
  handleCancel: () => void;
  handleAccept: (imageId: string) => void;
  hiddenImageIds?: string[];
}

export const ImageSelectionDialog = (props: ImageSelectionDialogProps) => {
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    rowsPerPage: 20,
  });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState("");
  const { handleAccept, handleCancel, hiddenImageIds } = props;
  const theme = useTheme();
  const handleExpiredToken = useHandleExpiredToken();

  const { rows, errors } = useMasterdata(
    backendApiUrl,
    { imageContent: true },
    1,
    handleExpiredToken
  );
  const { imageContentRows } = rows;

  const { rowsPerPage } = tableSettings;

  const filteredOrderedRows = useMemo(() => {
    const filteredRows = hiddenImageIds
      ? imageContentRows?.filter((row) => !hiddenImageIds.includes(row.imageId))
      : imageContentRows;
    return filteredRows
      ? filteredRows.sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime())
      : undefined;
  }, [imageContentRows, hiddenImageIds]);

  const maxPage = filteredOrderedRows
    ? Math.max(0, Math.ceil(filteredOrderedRows.length / rowsPerPage) - 1)
    : 0;

  useEffect(() => {
    setPage((previous) => {
      return Math.min(previous, maxPage);
    });
  }, [maxPage, rowsPerPage]);

  const usedPage = Math.min(page, maxPage);

  const visibleRows = useMemo(
    () =>
      filteredOrderedRows
        ? filteredOrderedRows.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          )
        : [],
    [page, rowsPerPage, filteredOrderedRows]
  );

  const visibleRowsWarning =
    imageContentRows && visibleRows
      ? !imageContentRows.length
        ? "Es sind keine Bilder vorhanden."
        : !visibleRows.length
        ? "Alle vorhandenen Bilder sind bereits zugeordnet."
        : undefined
      : undefined;

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
    <Dialog open={true} onClose={handleCancel}>
      <DialogTitle>{"Bild auswählen"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Klicken Sie auf ein Bild, um es auszuwählen. Ein Doppelklick wählt ein Bild aus und schließt den Dialog."
          }
        </DialogContentText>
        <ErrorDisplays results={errors} />
        <table>
          <thead>
            <tr>
              <TablePagination
                labelRowsPerPage={"Bilder pro Seite"}
                rowsPerPageOptions={[
                  10,
                  20,
                  30,
                  40,
                  50,
                  { label: "All", value: -1 },
                ]}
                count={filteredOrderedRows ? filteredOrderedRows.length : 0}
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
            </tr>
          </thead>
        </table>
        <Grid container direction="row">
          <Grid item>
            <Typography>{visibleRowsWarning}</Typography>
          </Grid>
          {visibleRows?.map((row) => (
            <Grid key={row.imageId} item>
              <Grid container direction="column">
                <Grid item>
                  <Box
                    style={{
                      padding: 2,
                      backgroundColor:
                        row.imageId === selected
                          ? theme.palette.primary.main
                          : undefined,
                    }}
                  >
                    <img
                      onClick={() => setSelected(row.imageId)}
                      onDoubleClick={() => handleAccept(row.imageId)}
                      src={getImageDisplayUrl(backendApiUrl, row.imageId)}
                      alt={row.imageId}
                      style={{ maxWidth: 300 }}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <Typography variant="caption">{row.imageId}</Typography>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!selected.length}
          onClick={() => handleAccept(selected)}
        >
          {"Speichern"}
        </Button>
        <Button onClick={handleCancel}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { TablePaginationActionsProps } from "@mui/material/TablePagination/TablePaginationActions";
import { MouseEventHandler } from "react";

export const TablePaginationActions = (props: TablePaginationActionsProps) => {
  const { count, page, rowsPerPage, onPageChange } = props;
  const maxPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  const handleFirstPageButtonClick: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    onPageChange(event, page > 0 ? page - 1 : page);
  };

  const handleNextButtonClick: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    onPageChange(event, page >= maxPage ? page : page + 1);
  };

  const handleLastPageButtonClick: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    onPageChange(event, maxPage);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
};

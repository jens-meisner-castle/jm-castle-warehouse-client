import { Alert, Snackbar } from "@mui/material";
import { ReducerState } from "../pages/masterdata/utils/Reducer";

export interface ActionStateSnackbarsProps<T> {
  actionState: ReducerState<T>;
  displayPayload: string;
  isAnySnackbarOpen: boolean;
  closeSnackbar: () => void;
}

export const ActionStateSnackbars = <T,>(
  props: ActionStateSnackbarsProps<T>
) => {
  const { actionState, displayPayload, isAnySnackbarOpen, closeSnackbar } =
    props;
  return (
    <>
      {actionState.previous && actionState.previous.action === "error-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={closeSnackbar}
        >
          <Alert severity="error">{`Fehler beim Speichern von ${displayPayload}. ${actionState.previous.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.previous && actionState.previous.action === "success-new" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={closeSnackbar}
        >
          <Alert severity="success">{`${displayPayload} wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
      {actionState.previous && actionState.previous.action === "error-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={closeSnackbar}
        >
          <Alert severity="error">{`Fehler beim Ändern von ${displayPayload}. ${actionState.previous.error}`}</Alert>
        </Snackbar>
      )}
      {actionState.previous && actionState.previous.action === "success-edit" && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isAnySnackbarOpen}
          autoHideDuration={6000}
          onClose={closeSnackbar}
        >
          <Alert severity="success">{`${displayPayload} wurde gespeichert.`}</Alert>
        </Snackbar>
      )}
    </>
  );
};

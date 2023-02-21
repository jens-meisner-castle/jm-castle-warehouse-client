import { Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useHandleExpiredToken } from "../../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../../components/AppActions";
import { ImageContentEditState } from "../../../../components/row-editor/ImageContentEditor";
import { backendApiUrl } from "../../../../configuration/Urls";
import { useImageContentInsert } from "../../../../hooks/useImageContentInsert";
import {
  fromRawImageContent,
  initialMasterdataRow,
  isImageContentRow,
  toRawImageContent,
} from "../../../../types/RowTypes";
import { CreateImageContentDialog } from "../../image/dialogs/CreateImageContentDialog";
import { ActionStateReducer } from "../../utils/Reducer";

export interface ImagesProps {
  count: number;
  onNew: () => void;
}

export const Images = (props: ImagesProps) => {
  const { count, onNew } = props;
  const handleExpiredToken = useHandleExpiredToken();

  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);

  const [actionState, dispatch] = useReducer(
    ActionStateReducer<ImageContentEditState>,
    { action: "none", data: undefined }
  );

  const dataToInsert = useMemo(() => {
    const { data } = actionState;
    const { row, newImage } = data || {};
    if (actionState.action === "accept-new" && row && isImageContentRow(row)) {
      const { file } = newImage || {};
      const newToInsert = { row: toRawImageContent(row), imageFile: file };
      return newToInsert;
    }
    return undefined;
  }, [actionState]);

  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
  }, []);

  const handleAccept = useCallback(
    (data: ImageContentEditState) => dispatch({ type: "accept", data }),
    []
  );

  useEffect(() => {
    if (actionState.action === "success-new") {
      onNew();
      dispatch({ type: "reset" });
    }
    if (actionState.action === "error-new") {
      dispatch({ type: "reset" });
    }
  }, [actionState, onNew]);

  const { response: insertResponse, error: insertError } =
    useImageContentInsert(
      backendApiUrl,
      dataToInsert ? dataToInsert.row.image_id : undefined,
      dataToInsert ? dataToInsert.row.image_extension : undefined,
      dataToInsert ? dataToInsert.imageFile : undefined,
      1,
      handleExpiredToken
    );
  const { result: insertResult } = insertResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.row.image_id === resultData.image_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: { row: fromRawImageContent(resultData) },
        });
        setIsAnySnackbarOpen(true);
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: { row: fromRawImageContent(dataToInsert.row) },
        error: insertError,
      });
      setIsAnySnackbarOpen(true);
    }
  }, [dataToInsert, insertResult, insertError]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: "Show",
      onClickNavigate: { to: "/masterdata/image" },
    });
    newActions.push({
      label: "New",
      onClick: () =>
        dispatch({ type: "new", data: { row: initialMasterdataRow() } }),
    });
    return newActions;
  }, []);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Bild <${actionState.previous?.data.row.imageId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data?.row && (
        <CreateImageContentDialog
          imageContent={actionState.data.row}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography>{`Bilder (${count})`}</Typography>
        </Grid>
        <Grid item>
          <AppActions actions={actions} />
        </Grid>
      </Grid>
    </>
  );
};

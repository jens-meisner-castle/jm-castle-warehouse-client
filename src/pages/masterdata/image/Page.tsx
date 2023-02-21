import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppActionEdit } from "../../../app-action/useAppActionEdit";
import { useAppActionFilter } from "../../../app-action/useAppActionFilter";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorDisplays } from "../../../components/ErrorDisplays";
import { FilteredRowsDisplay } from "../../../components/FilteredRowsDisplay";
import { ImageContentEditState } from "../../../components/row-editor/ImageContentEditor";
import {
  ImagesTable,
  sizeVariantForWidth,
} from "../../../components/table/ImagesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useImageContentInsert } from "../../../hooks/useImageContentInsert";
import { useImageContentUpdate } from "../../../hooks/useImageContentUpdate";
import { useMasterdata } from "../../../hooks/useMasterdata";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareImageRow,
  fromRawImageContent,
  ImageContentRow,
  initialMasterdataRow,
  isImageContentRow,
  toRawImageContent,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import { getFilteredOrderedRows } from "../../../utils/Compare";
import { ActionStateReducer, getValidInitialAction } from "../utils/Reducer";
import { CreateImageContentDialog } from "./dialogs/CreateImageContentDialog";
import { EditImageContentDialog } from "./dialogs/EditImageContentDialog";

const filterTest: FilterTest<ImageContentRow> = {
  nameFragment: ["imageId"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<ImageContentRow>[]>([
    { field: "imageId", direction: "ascending" },
  ]);
  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const { filterAction, isFilterVisible } = useAppActionFilter(false);
  const { editAction, isEditActive, setIsEditActive } = useAppActionEdit(false);

  const handleExpiredToken = useHandleExpiredToken();
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataImageContent.path, { replace: true }),
    [initialAction, navigate]
  );

  const { rows, errors: errorData } = useMasterdata(
    backendApiUrl,
    { imageContent: true },
    updateIndicator,
    handleExpiredToken
  );
  const { imageContentRows } = rows;

  const filteredOrderedRows = useMemo(() => {
    return getFilteredOrderedRows(
      imageContentRows,
      passFilter,
      order,
      compareImageRow
    );
  }, [imageContentRows, passFilter, order]);

  const [actionState, dispatch] = useReducer(
    ActionStateReducer<ImageContentEditState>,
    { action: "none", data: undefined }
  );

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction) {
      switch (initialAction) {
        case "new":
          {
            setIsEditActive(true);
            dispatch({
              type: "new",
              data: {
                row: initialMasterdataRow(),
              },
            });
          }
          break;
        case "edit": {
          const imageId = params?.imageId;
          const row = imageId
            ? imageContentRows?.find((row) => row.imageId === imageId)
            : undefined;
          if (row) {
            setIsEditActive(true);
            dispatch({
              type: "edit",
              data: { row },
            });
          }
          break;
        }
        case "duplicate":
          {
            const imageId = params?.imageId;
            const data = imageId
              ? imageContentRows?.find((row) => row.imageId === imageId)
              : undefined;
            if (data) {
              setIsEditActive(true);
              dispatch({
                type: "new",
                data: {
                  row: {
                    ...initialMasterdataRow(),
                    imageId: `${data.imageId}-copy`,
                  },
                },
              });
            }
          }
          break;
      }
    }
  }, [initialAction, setIsEditActive, params, imageContentRows]);
  const handleEdit = useCallback(
    (row: ImageContentRow) => {
      navigate(
        `${allRoutes().masterdataImageContent.path}?action=edit&imageId=${
          row.imageId
        }`
      );
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: ImageContentRow) => {
      navigate(
        `${allRoutes().masterdataImageContent.path}?action=duplicate&imageId=${
          row.imageId
        }`
      );
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);
  const handleAccept = useCallback(
    (data: ImageContentEditState) => dispatch({ type: "accept", data }),
    []
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

  const dataToUpdate = useMemo(() => {
    const { data } = actionState;
    const { row, newImage } = data || {};
    if (actionState.action === "accept-edit" && row && isImageContentRow(row)) {
      const { file } = newImage || {};
      const newToUpdate = {
        row: toRawImageContent(row),
        imageFile: file,
      };
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
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

  const { response: updateResponse, error: updateError } =
    useImageContentUpdate(
      backendApiUrl,
      dataToUpdate ? dataToUpdate.row.image_id : undefined,
      dataToUpdate ? dataToUpdate.row.image_extension : undefined,
      dataToUpdate ? dataToUpdate.row.dataset_version : undefined,
      dataToUpdate ? dataToUpdate.imageFile : undefined,
      1,
      handleExpiredToken
    );
  const { result: updateResult } = updateResponse || {};

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
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: { row: fromRawImageContent(dataToInsert.row) },
        error: insertError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
      refreshStatus();
    }
  }, [
    dataToInsert,
    insertResult,
    insertError,
    resetInitialAction,
    refreshStatus,
  ]);

  useEffect(() => {
    const { data: resultData } = updateResult || {};
    if (dataToUpdate && resultData) {
      if (dataToUpdate.row.image_id === resultData.image_id) {
        // dann hat das Aktualisieren geklappt
        dispatch({
          type: "success",
          data: { row: fromRawImageContent(resultData) },
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: { row: fromRawImageContent(dataToUpdate.row) },
        error: updateError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
      refreshStatus();
    }
  }, [
    dataToUpdate,
    updateResult,
    updateError,
    resetInitialAction,
    refreshStatus,
  ]);

  const actions = useMemo(() => {
    const newActions: AppAction[] = [];
    newActions.push({
      label: <RefreshIcon />,
      tooltip: "Daten aktualisieren",
      onClick: refreshStatus,
    });
    newActions.push(filterAction);
    newActions.push(editAction);
    isEditActive &&
      newActions.push({
        label: <AddBoxIcon />,
        tooltip: "Neuen Datensatz anlegen",
        onClick: () =>
          navigate(`${allRoutes().masterdataImageContent.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Bild <${actionState.previous?.data.row.imageId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data.row && (
        <CreateImageContentDialog
          imageContent={actionState.data.row}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditImageContentDialog
          imageContent={actionState.data.row}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Bilder"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        {isFilterVisible && (
          <Grid item>
            <Paper style={{ marginBottom: 5, padding: 5 }}>
              <ArbitraryFilterComponent
                filter={filter}
                onChange={handleFilterChange}
                aspects={filterAspects}
                helpNameFragment={"Sucht in der ID."}
                handleExpiredToken={handleExpiredToken}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <FilteredRowsDisplay
            all={imageContentRows}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <ImagesTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable={isEditActive}
                  displayImage="small"
                  data={filteredOrderedRows || []}
                  order={order}
                  onOrderChange={setOrder}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  sizeVariant={tableSize}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

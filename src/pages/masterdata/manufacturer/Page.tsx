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
import {
  ManufacturersTable,
  sizeVariantForWidth,
} from "../../../components/table/ManufacturersTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useManufacturerInsert } from "../../../hooks/useManufacturerInsert";
import { useManufacturerUpdate } from "../../../hooks/useManufacturerUpdate";
import { useMasterdata } from "../../../hooks/useMasterdata";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareManufacturerRow,
  fromRawManufacturer,
  ManufacturerRow,
  toRawManufacturer,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import { ActionStateReducer, getValidInitialAction } from "../utils/Reducer";
import { CreateManufacturerDialog } from "./dialogs/CreateManufacturerDialog";
import { EditManufacturerDialog } from "./dialogs/EditManufacturerDialog";

const filterTest: FilterTest<ManufacturerRow> = {
  nameFragment: ["manufacturerId", "name"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<ManufacturerRow>[]>([
    { field: "manufacturerId", direction: "ascending" },
  ]);

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const { isFilterVisible, filterAction } = useAppActionFilter(false);
  const { isEditActive, setIsEditActive, editAction } = useAppActionEdit(false);

  const handleExpiredToken = useHandleExpiredToken();
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataManufacturer.path, { replace: true }),
    [initialAction, navigate]
  );

  const { rows, errors: errorData } = useMasterdata(
    backendApiUrl,
    { manufacturer: true },
    updateIndicator,
    handleExpiredToken
  );
  const { manufacturerRows } = rows;

  const filteredOrderedRows = useMemo(() => {
    if (!manufacturerRows) return undefined;
    const filtered = manufacturerRows.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<ManufacturerRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareManufacturerRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [manufacturerRows, passFilter, order]);

  const [actionState, dispatch] = useReducer(
    ActionStateReducer<ManufacturerRow>,
    { action: "none", data: undefined }
  );

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && manufacturerRows) {
      switch (initialAction) {
        case "new":
          {
            setIsEditActive(true);
            dispatch({
              type: "new",
              data: {
                manufacturerId: "",
                name: "",
                datasetVersion: 1,
                createdAt: new Date(),
                editedAt: new Date(),
              },
            });
          }
          break;
        case "edit": {
          const manufacturerId = params?.manufacturerId;
          console.log(manufacturerId);
          const row = manufacturerId
            ? manufacturerRows.find(
                (row) => row.manufacturerId === manufacturerId
              )
            : undefined;
          if (row) {
            setIsEditActive(true);
            dispatch({
              type: "edit",
              data: row,
            });
          }
          break;
        }
        case "duplicate":
          {
            const manufacturerId = params?.manufacturerId;
            const data = manufacturerId
              ? manufacturerRows.find(
                  (row) => row.manufacturerId === manufacturerId
                )
              : undefined;
            if (data) {
              setIsEditActive(true);
              dispatch({
                type: "new",
                data: {
                  ...data,
                  datasetVersion: 1,
                  createdAt: new Date(),
                  editedAt: new Date(),
                },
              });
            }
          }
          break;
      }
    }
  }, [initialAction, setIsEditActive, params, manufacturerRows]);
  const handleEdit = useCallback(
    (row: ManufacturerRow) => {
      navigate(
        `${
          allRoutes().masterdataManufacturer.path
        }?action=edit&manufacturerId=${row.manufacturerId}`
      );
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: ManufacturerRow) => {
      navigate(
        `${
          allRoutes().masterdataManufacturer.path
        }?action=duplicate&manufacturerId=${row.manufacturerId}`
      );
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);

  const handleAccept = useCallback(
    (data: ManufacturerRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawManufacturer(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToUpdate = toRawManufacturer(data);
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } =
    useManufacturerInsert(backendApiUrl, dataToInsert, 1, handleExpiredToken);
  const { result: insertResult } = insertResponse || {};

  const { response: updateResponse, error: updateError } =
    useManufacturerUpdate(
      backendApiUrl,
      dataToUpdate,
      dataToUpdate ? 1 : 0,
      handleExpiredToken
    );

  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.manufacturer_id === resultData.manufacturer_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawManufacturer(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawManufacturer(dataToInsert),
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
      if (dataToUpdate.manufacturer_id === resultData.manufacturer_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawManufacturer(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawManufacturer(dataToUpdate),
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
          navigate(`${allRoutes().masterdataManufacturer.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Hersteller <${actionState.previous?.data.manufacturerId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateManufacturerDialog
          manufacturer={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditManufacturerDialog
          manufacturer={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Hersteller"}</Typography>
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
                helpNameFragment={"Sucht in der ID und im Namen."}
                handleExpiredToken={handleExpiredToken}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <FilteredRowsDisplay
            all={manufacturerRows}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <ManufacturersTable
                  containerStyle={{ width: "100%", maxWidth: 1200 }}
                  editable={isEditActive}
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

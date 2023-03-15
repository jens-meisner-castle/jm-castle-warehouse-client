import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Typography } from "@mui/material";
import { AppAction, AppActions } from "jm-castle-components/build";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppActionEdit } from "../../../app-action/useAppActionEdit";
import { useAppActionFilter } from "../../../app-action/useAppActionFilter";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { ShowQrCodeDialog } from "../../../components/dialog/ShowQrCodeDialog";
import { ErrorDisplays } from "../../../components/ErrorDisplays";
import { FilteredRowsDisplay } from "../../../components/FilteredRowsDisplay";
import {
  sizeVariantForWidth,
  StoreSectionsTable,
} from "../../../components/table/StoreSectionsTable";
import {
  backendApiUrl,
  getCompleteUrlForPath,
} from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useMasterdata } from "../../../hooks/pagination/useMasterdata";
import { useStoreSectionInsert } from "../../../hooks/useStoreSectionInsert";
import { useStoreSectionUpdate } from "../../../hooks/useStoreSectionUpdate";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareStoreSectionRow,
  fromRawStoreSection,
  StoreSectionRow,
  toRawStoreSection,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import { ActionStateReducer, getValidInitialAction } from "../utils/Reducer";
import { CreateStoreSectionDialog } from "./dialogs/CreateStoreSectionDialog";
import { EditStoreSectionDialog } from "./dialogs/EditStoreSectionDialog";

const filterTest: FilterTest<StoreSectionRow> = {
  nameFragment: ["sectionId", "name"],
  store: ["storeId"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<StoreSectionRow>[]>([
    { field: "sectionId", direction: "ascending" },
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
  const initialAction = getValidInitialAction(action);
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";

  const [showQrCode, setShowQrCode] = useState<StoreSectionRow | undefined>(
    undefined
  );
  const qrCodeContent = useMemo(() => {
    if (!showQrCode) return undefined;
    const url = getCompleteUrlForPath(allRoutes().stockSectionDetail.path);
    const params = new URLSearchParams({ sectionId: showQrCode.sectionId });
    return `${url}?${params.toString()}`;
  }, [showQrCode]);

  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataStoreSection.path, { replace: true }),
    [initialAction, navigate]
  );

  const { rows, errors: errorData } = useMasterdata(
    backendApiUrl,
    { store: true, section: true },
    updateIndicator,
    handleExpiredToken
  );
  const { storeRows, sectionRows } = rows;

  const filteredOrderedRows = useMemo(() => {
    if (!sectionRows) return undefined;
    const filtered = sectionRows.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<StoreSectionRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareStoreSectionRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [sectionRows, order, passFilter]);

  const [actionState, dispatch] = useReducer(
    ActionStateReducer<StoreSectionRow>,
    { action: "none", data: undefined }
  );
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && sectionRows) {
      switch (initialAction) {
        case "new":
          {
            setIsEditActive(true);
            dispatch({
              type: "new",
              data: {
                sectionId: "",
                storeId: "",
                name: "",
                shortId: "",
                imageRefs: undefined,
                datasetVersion: 1,
                createdAt: new Date(),
                editedAt: new Date(),
              },
            });
          }
          break;
        case "edit": {
          const sectionId = params?.sectionId;
          const data = sectionId
            ? sectionRows.find((row) => row.sectionId === sectionId)
            : undefined;
          if (data) {
            setIsEditActive(true);
            dispatch({
              type: "edit",
              data,
            });
          }
          break;
        }
        case "duplicate":
          {
            const sectionId = params?.sectionId;
            const data = sectionId
              ? sectionRows.find((row) => row.sectionId === sectionId)
              : undefined;
            if (data) {
              setIsEditActive(true);
              dispatch({
                type: "new",
                data: {
                  ...data,
                  sectionId: `${data.sectionId}-copy`,
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
  }, [initialAction, setIsEditActive, params, sectionRows]);
  const handleDuplicate = useCallback(
    (row: StoreSectionRow) => {
      navigate(
        `${
          allRoutes().masterdataStoreSection.path
        }?action=duplicate&sectionId=${row.sectionId}`
      );
    },
    [navigate]
  );
  const handleEdit = useCallback(
    (row: StoreSectionRow) => {
      navigate(
        `${allRoutes().masterdataStoreSection.path}?action=edit&sectionId=${
          row.sectionId
        }`
      );
    },
    [navigate]
  );
  const handleCancel = useCallback(() => {
    dispatch({ type: "cancel" });
    resetInitialAction();
  }, [resetInitialAction]);
  const handleAcceptNew = useCallback(
    (section: StoreSectionRow) => dispatch({ type: "accept", data: section }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawStoreSection(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToInsert = toRawStoreSection(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);

  const { response: insertResponse, error: insertError } =
    useStoreSectionInsert(backendApiUrl, dataToInsert, 1);
  const { result: insertResult } = insertResponse || {};
  const { response: updateResponse, error: updateError } =
    useStoreSectionUpdate(backendApiUrl, dataToUpdate, 1);
  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.section_id === resultData.section_id) {
        // dann hat das Einfügen geklappt
        dispatch({ type: "success", data: fromRawStoreSection(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawStoreSection(dataToInsert),
        error: insertError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
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
      if (dataToUpdate.section_id === resultData.section_id) {
        // dann hat das Aktualisieren geklappt
        dispatch({ type: "success", data: fromRawStoreSection(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawStoreSection(dataToUpdate),
        error: updateError,
      });
      setIsAnySnackbarOpen(true);
      resetInitialAction();
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
          navigate(`${allRoutes().masterdataStoreSection.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Lagerbereich <${actionState.previous?.data.sectionId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && storeRows && (
        <CreateStoreSectionDialog
          section={actionState.data}
          stores={storeRows}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {actionState.action === "edit" && actionState.data && storeRows && (
        <EditStoreSectionDialog
          section={actionState.data}
          stores={storeRows}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {showQrCode && qrCodeContent && (
        <ShowQrCodeDialog
          heading={"QR Code"}
          description={`QR Code für Lagerbereich: ${showQrCode.sectionId}`}
          codeContent={qrCodeContent}
          handleClose={() => setShowQrCode(undefined)}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Lagerbereich"}</Typography>
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
            all={sectionRows}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <StoreSectionsTable
                  editable={isEditActive}
                  data={filteredOrderedRows || []}
                  order={order}
                  onOrderChange={setOrder}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onShowQrCode={setShowQrCode}
                  sizeVariant={tableSize}
                  displayImage="small"
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHandleExpiredToken } from "../../../auth/AuthorizationProvider";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ShowQrCodeDialog } from "../../../components/dialog/ShowQrCodeDialog";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import {
  sizeVariantForWidth,
  StoreSectionsTable,
} from "../../../components/table/StoreSectionsTable";
import {
  backendApiUrl,
  getCompleteUrlForPath,
} from "../../../configuration/Urls";
import {
  ArbitraryFilterComponent,
  FilterAspect,
} from "../../../filter/ArbitraryFilterComponent";
import { ArbitraryFilter } from "../../../filter/Types";
import { useStoreSectionInsert } from "../../../hooks/useStoreSectionInsert";
import { useStoreSectionSelect } from "../../../hooks/useStoreSectionSelect";
import { useStoreSectionUpdate } from "../../../hooks/useStoreSectionUpdate";
import { useStoreSelect } from "../../../hooks/useStoreSelect";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareStoreSectionRow,
  fromRawStore,
  fromRawStoreSection,
  StoreRow,
  StoreSectionRow,
  toRawStoreSection,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import {
  CompareFunction,
  concatCompares,
  isNonEmptyArray,
} from "../../../utils/Compare";
import {
  ActionStateReducer,
  getValidInitialAction,
  ReducerState,
} from "../utils/Reducer";
import { CreateStoreSectionDialog } from "./dialogs/CreateStoreSectionDialog";
import { EditStoreSectionDialog } from "./dialogs/EditStoreSectionDialog";

const filterAspects: FilterAspect[] = ["store", "nameFragment"];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<StoreSectionRow>[]>([
    { field: "sectionId", direction: "ascending" },
  ]);
  const [filter, setFilter] = useState<ArbitraryFilter>({});
  const [isFilterComponentVisible, setIsFilterComponentVisible] =
    useState(false);

  const handleFilterChange = useCallback(
    (changes: Partial<ArbitraryFilter>) => {
      setFilter((previous) => {
        const newFilter = { ...previous, ...changes };
        return Object.keys(newFilter).find(
          (k) => newFilter[k as keyof typeof newFilter]
        )
          ? newFilter
          : {};
      });
    },
    []
  );

  const handleHideFilterComponent = useCallback(
    () => setIsFilterComponentVisible(false),
    []
  );
  const handleShowFilterComponent = useCallback(
    () => setIsFilterComponentVisible(true),
    []
  );
  const passFilter = useCallback(
    (row: StoreSectionRow) => {
      const { nameFragment } = filter;
      if (nameFragment?.length) {
        if (
          row.sectionId.indexOf(nameFragment) < 0 &&
          row.name.indexOf(nameFragment) < 0
        )
          return false;
      }
      return true;
    },
    [filter]
  );
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

  const sectionApiResponse = useStoreSectionSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: sectionResponse } = sectionApiResponse;
  const { result: sectionResult } = sectionResponse || {};
  const rows = useMemo(() => {
    if (sectionResult) {
      const newRows: StoreSectionRow[] = [];
      sectionResult.rows.forEach((r) => {
        const newRow = fromRawStoreSection(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [sectionResult]);

  const filteredOrderedRows = useMemo(() => {
    if (!rows) return undefined;
    const filtered = rows.filter((row) => passFilter(row));
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
  }, [rows, order, passFilter]);

  const filteredRowsDisplay =
    rows?.length &&
    filteredOrderedRows &&
    rows.length !== filteredOrderedRows.length
      ? `${filteredOrderedRows.length} Datenzeilen von ${rows.length} gefiltert`
      : undefined;

  const storeApiResponse = useStoreSelect(
    backendApiUrl,
    "%",
    updateIndicator,
    handleExpiredToken
  );
  const { response: storeResponse } = storeApiResponse;
  const { result: storeResult } = storeResponse || {};
  const storeRows = useMemo(() => {
    if (storeResult) {
      const newRows: StoreRow[] = [];
      storeResult.rows.forEach((r) => {
        const newRow = fromRawStore(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [storeResult]);

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.store = storeApiResponse;
    newData.section = sectionApiResponse;
    return newData;
  }, [storeApiResponse, sectionApiResponse]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<StoreSectionRow>,
    ReducerState<StoreSectionRow>
  >(
    ActionStateReducer<StoreSectionRow>,
    { action: "none", data: undefined },
    () => ({
      action: "none",
      data: undefined,
    })
  );
  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && rows) {
      switch (initialAction) {
        case "new":
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
          break;
        case "edit": {
          const sectionId = params?.sectionId;
          const data = sectionId
            ? rows.find((row) => row.sectionId === sectionId)
            : undefined;
          data &&
            dispatch({
              type: "edit",
              data,
            });
          break;
        }
        case "duplicate":
          {
            const sectionId = params?.sectionId;
            const data = sectionId
              ? rows.find((row) => row.sectionId === sectionId)
              : undefined;
            data &&
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
          break;
      }
    }
  }, [initialAction, params, rows]);
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
    newActions.push({
      label: isFilterComponentVisible ? <FilterAltOff /> : <FilterAlt />,
      tooltip: isFilterComponentVisible
        ? "Filter ausblenden"
        : "Filter einblenden",
      onClick: isFilterComponentVisible
        ? handleHideFilterComponent
        : handleShowFilterComponent,
    });
    newActions.push({
      label: (
        <Tooltip title="Neuen Datensatz anlegen">
          <AddBoxIcon />
        </Tooltip>
      ),
      onClick: () =>
        navigate(`${allRoutes().masterdataStoreSection.path}?action=new`),
    });
    return newActions;
  }, [
    refreshStatus,
    handleHideFilterComponent,
    handleShowFilterComponent,
    isFilterComponentVisible,
    navigate,
  ]);

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
        {isFilterComponentVisible && (
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
        {filteredRowsDisplay && (
          <Grid item>
            <Typography>{filteredRowsDisplay}</Typography>
          </Grid>
        )}
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <StoreSectionsTable
                  editable
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

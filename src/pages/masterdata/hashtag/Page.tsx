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
  HashtagsTable,
  sizeVariantForWidth,
} from "../../../components/table/HashtagsTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { ArbitraryFilterComponent } from "../../../filter/ArbitraryFilterComponent";
import { FilterAspect } from "../../../filter/Types";
import {
  FilterTest,
  useArbitraryFilter,
} from "../../../filter/useArbitraryFilter";
import { useHashtagInsert } from "../../../hooks/useHashtagInsert";
import { useHashtagUpdate } from "../../../hooks/useHashtagUpdate";
import { useMasterdata } from "../../../hooks/useMasterdata";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  compareHashtagRow,
  fromRawHashtag,
  HashtagRow,
  toRawHashtag,
} from "../../../types/RowTypes";
import { OrderElement } from "../../../types/Types";
import { getFilteredOrderedRows } from "../../../utils/Compare";
import { ActionStateReducer, getValidInitialAction } from "../utils/Reducer";
import { CreateHashtagDialog } from "./dialogs/CreateHashtagDialog";
import { EditHashtagDialog } from "./dialogs/EditHashtagDialog";

const filterTest: FilterTest<HashtagRow> = {
  nameFragment: ["tagId", "name"],
};

const filterAspects = Object.keys(filterTest) as FilterAspect[];

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<HashtagRow>[]>([
    { field: "tagId", direction: "ascending" },
  ]);
  const handleExpiredToken = useHandleExpiredToken();
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";
  const initialAction = getValidInitialAction(action);
  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataHashtag.path, { replace: true }),
    [initialAction, navigate]
  );

  const { filter, handleFilterChange, passFilter } = useArbitraryFilter(
    {},
    filterTest
  );

  const { isFilterVisible, filterAction } = useAppActionFilter(false);
  const { isEditActive, setIsEditActive, editAction } = useAppActionEdit(false);

  const { errors: errorData, rows } = useMasterdata(
    backendApiUrl,
    { hashtag: true },
    updateIndicator,
    handleExpiredToken
  );

  const { hashtagRows } = rows;

  const filteredOrderedRows = useMemo(() => {
    return getFilteredOrderedRows(
      hashtagRows,
      passFilter,
      order,
      compareHashtagRow
    );
  }, [hashtagRows, passFilter, order]);

  const [actionState, dispatch] = useReducer(ActionStateReducer<HashtagRow>, {
    action: "none",
    data: undefined,
  });

  const refreshStatus = useCallback(() => {
    setUpdateIndicator((previous) => previous + 1);
    dispatch({ type: "reset" });
    resetInitialAction();
  }, [resetInitialAction]);

  useEffect(() => {
    if (initialAction && hashtagRows) {
      switch (initialAction) {
        case "new":
          {
            setIsEditActive(true);
            dispatch({
              type: "new",
              data: {
                tagId: "",
                name: "",
                datasetVersion: 1,
                createdAt: new Date(),
                editedAt: new Date(),
              },
            });
          }
          break;
        case "edit": {
          const tagId = params?.tagId;
          const row = tagId
            ? hashtagRows.find((row) => row.tagId === tagId)
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
            const tagId = params?.tagId;
            const data = tagId
              ? hashtagRows.find((row) => row.tagId === tagId)
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
  }, [initialAction, params, setIsEditActive, hashtagRows]);
  const handleEdit = useCallback(
    (row: HashtagRow) => {
      navigate(
        `${allRoutes().masterdataHashtag.path}?action=edit&tagId=${row.tagId}`
      );
    },
    [navigate]
  );
  const handleDuplicate = useCallback(
    (row: HashtagRow) => {
      navigate(
        `${allRoutes().masterdataHashtag.path}?action=duplicate&tagId=${
          row.tagId
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
    (data: HashtagRow) => dispatch({ type: "accept", data }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawHashtag(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToUpdate = toRawHashtag(data);
      return newToUpdate;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } = useHashtagInsert(
    backendApiUrl,
    dataToInsert,
    1,
    handleExpiredToken
  );
  const { result: insertResult } = insertResponse || {};

  const { response: updateResponse, error: updateError } = useHashtagUpdate(
    backendApiUrl,
    dataToUpdate,
    dataToUpdate ? 1 : 0,
    handleExpiredToken
  );

  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.tag_id === resultData.tag_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawHashtag(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawHashtag(dataToInsert),
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
      if (dataToUpdate.tag_id === resultData.tag_id) {
        // dann hat das Einfügen geklappt
        dispatch({
          type: "success",
          data: fromRawHashtag(resultData),
        });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawHashtag(dataToUpdate),
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
          navigate(`${allRoutes().masterdataHashtag.path}?action=new`),
      });
    return newActions;
  }, [refreshStatus, filterAction, editAction, isEditActive, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Hashtag <${actionState.previous?.data.tagId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateHashtagDialog
          hashtag={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditHashtagDialog
          hashtag={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Hashtag"}</Typography>
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
            all={hashtagRows}
            filtered={filteredOrderedRows}
          />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <HashtagsTable
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

import AddBoxIcon from "@mui/icons-material/AddBox";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionStateSnackbars } from "../../../components/ActionStateSnackbars";
import { AppAction, AppActions } from "../../../components/AppActions";
import { ErrorData, ErrorDisplays } from "../../../components/ErrorDisplays";
import {
  AttributesTable,
  sizeVariantForWidth,
} from "../../../components/table/AttributesTable";
import { backendApiUrl } from "../../../configuration/Urls";
import { useAttributeInsert } from "../../../hooks/useAttributeInsert";
import { useAttributeSelect } from "../../../hooks/useAttributeSelect";
import { useAttributeUpdate } from "../../../hooks/useAttributeUpdate";
import { useUrlAction } from "../../../hooks/useUrlAction";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { allRoutes } from "../../../navigation/AppRoutes";
import {
  AttributeRow,
  compareAttributeRow,
  fromRawAttribute,
  toRawAttribute,
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
import { CreateAttributeDialog } from "./dialogs/CreateAttributeDialog";
import { EditAttributeDialog } from "./dialogs/EditAttributeDialog";

export const Page = () => {
  const [updateIndicator, setUpdateIndicator] = useState(1);
  const [isAnySnackbarOpen, setIsAnySnackbarOpen] = useState(false);
  const [order, setOrder] = useState<OrderElement<AttributeRow>[]>([
    { field: "attributeId", direction: "ascending" },
  ]);
  const navigate = useNavigate();
  const { action, params } = useUrlAction() || {};
  const initialAction = getValidInitialAction(action);
  const { width } = useWindowSize() || {};
  const tableSize = width ? sizeVariantForWidth(width) : "tiny";

  const resetInitialAction = useCallback(
    () =>
      initialAction !== "none" &&
      navigate(allRoutes().masterdataAttribute.path, { replace: true }),
    [initialAction, navigate]
  );

  const attributeApiResponse = useAttributeSelect(
    backendApiUrl,
    "%",
    updateIndicator
  );
  const { response: selectResponse } = attributeApiResponse;
  const { result: selectResult } = selectResponse || {};

  const errorData = useMemo(() => {
    const newData: Record<string, ErrorData> = {};
    newData.attribute = attributeApiResponse;
    return newData;
  }, [attributeApiResponse]);

  const rows = useMemo(() => {
    if (selectResult) {
      const newRows: AttributeRow[] = [];
      selectResult.rows.forEach((r) => {
        const newRow = fromRawAttribute(r);
        newRows.push(newRow);
      });
      newRows.sort((a, b) => a.name.localeCompare(b.name));
      return newRows;
    }
    return undefined;
  }, [selectResult]);

  const filteredOrderedRows = useMemo(() => {
    if (!rows) return undefined;
    const filtered = [...rows]; //.filter((row) => passFilter(row));
    const activeOrder = order?.filter((e) => e.direction) || [];
    if (activeOrder.length) {
      const compares: CompareFunction<AttributeRow>[] = [];
      activeOrder.forEach((e) => {
        const { field, direction } = e;
        const compare = compareAttributeRow[field];
        const compareFn = direction && compare && compare(direction);
        compareFn && compares.push(compareFn);
      });
      isNonEmptyArray(compares) && filtered.sort(concatCompares(compares));
    }
    return filtered;
  }, [rows, order]);

  const [actionState, dispatch] = useReducer<
    typeof ActionStateReducer<AttributeRow>,
    ReducerState<AttributeRow>
  >(
    ActionStateReducer<AttributeRow>,
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
              attributeId: "",
              name: "",
              valueType: "string",
              valueUnit: undefined,
              datasetVersion: 1,
              createdAt: new Date(),
              editedAt: new Date(),
            },
          });
          break;
        case "edit": {
          const attributeId = params?.attributeId;
          const data = attributeId
            ? rows.find((row) => row.attributeId === attributeId)
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
            const attributeId = params?.attributeId;
            const data = attributeId
              ? rows.find((row) => row.attributeId === attributeId)
              : undefined;
            data &&
              dispatch({
                type: "new",
                data: {
                  ...data,
                  attributeId: `${data.attributeId}-copy`,
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
    (row: AttributeRow) => {
      navigate(
        `${allRoutes().masterdataAttribute.path}?action=duplicate&attributeId=${
          row.attributeId
        }`
      );
    },
    [navigate]
  );
  const handleEdit = useCallback(
    (row: AttributeRow) => {
      navigate(
        `${allRoutes().masterdataAttribute.path}?action=edit&attributeId=${
          row.attributeId
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
    (attribute: AttributeRow) => dispatch({ type: "accept", data: attribute }),
    []
  );

  const dataToInsert = useMemo(() => {
    if (actionState.action === "accept-new") {
      const { data } = actionState;
      const newToInsert = toRawAttribute(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const dataToUpdate = useMemo(() => {
    if (actionState.action === "accept-edit") {
      const { data } = actionState;
      const newToInsert = toRawAttribute(data);
      return newToInsert;
    }
    return undefined;
  }, [actionState]);
  const { response: insertResponse, error: insertError } = useAttributeInsert(
    backendApiUrl,
    dataToInsert,
    1
  );
  const { result: insertResult } = insertResponse || {};
  const { response: updateResponse, error: updateError } = useAttributeUpdate(
    backendApiUrl,
    dataToUpdate,
    1
  );
  const { result: updateResult } = updateResponse || {};

  useEffect(() => {
    const { data: resultData } = insertResult || {};
    if (dataToInsert && resultData) {
      if (dataToInsert.attribute_id === resultData.attribute_id) {
        // dann hat das Einfügen geklappt
        dispatch({ type: "success", data: fromRawAttribute(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToInsert && insertError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawAttribute(dataToInsert),
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
      if (dataToUpdate.attribute_id === resultData.attribute_id) {
        // dann hat das Aktualisieren geklappt
        dispatch({ type: "success", data: fromRawAttribute(resultData) });
        setIsAnySnackbarOpen(true);
        resetInitialAction();
        refreshStatus();
      }
    } else if (dataToUpdate && updateError) {
      // dann ist etwas schief gelaufen
      dispatch({
        type: "error",
        data: fromRawAttribute(dataToUpdate),
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
      label: (
        <Tooltip title="Neuen Datensatz anlegen">
          <AddBoxIcon />
        </Tooltip>
      ),
      onClick: () =>
        navigate(`${allRoutes().masterdataAttribute.path}?action=new`),
    });
    return newActions;
  }, [refreshStatus, navigate]);

  return (
    <>
      <ActionStateSnackbars
        actionState={actionState}
        displayPayload={`Attribut <${actionState.previous?.data.attributeId}>`}
        isAnySnackbarOpen={isAnySnackbarOpen}
        closeSnackbar={() => setIsAnySnackbarOpen(false)}
      />
      {actionState.action === "new" && actionState.data && (
        <CreateAttributeDialog
          attribute={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      {actionState.action === "edit" && actionState.data && (
        <EditAttributeDialog
          attribute={actionState.data}
          open={true}
          handleCancel={handleCancel}
          handleAccept={handleAcceptNew}
        />
      )}
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">{"Attribute"}</Typography>
        </Grid>
        <Grid item>
          <Paper style={{ padding: 5, marginBottom: 5 }}>
            <AppActions actions={actions} />
          </Paper>
        </Grid>
        <Grid item>
          <ErrorDisplays results={errorData} />
        </Grid>
        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Paper style={{ padding: 5 }}>
                <AttributesTable
                  editable
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

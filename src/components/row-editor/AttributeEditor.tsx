import { MenuItem, TextField } from "@mui/material";
import {
  isValueType,
  isValueUnit,
  ValueType,
  ValueUnit,
  ValueUnits,
} from "jm-castle-types/build";
import { ValueTypes } from "jm-castle-warehouse-types/build";
import { useCallback, useMemo } from "react";
import { AttributeRow, isSavingAttributeAllowed } from "../../types/RowTypes";
import { TextFieldWithSpeech } from "../TextFieldWithSpeech";

export interface AttributeEditorProps {
  row: Partial<AttributeRow>;
  mode: "edit" | "create";
  onChange: (updates: Partial<AttributeRow>) => void;
}

export const AttributeEditor = (props: AttributeEditorProps) => {
  const { row, mode, onChange } = props;

  const { errorData } = isSavingAttributeAllowed(row);

  const { attributeId, name, valueType, valueUnit } = row;

  const valueTypes = useMemo(
    () =>
      Object.keys(ValueTypes).map((k) => ({
        id: k,
        name: ValueTypes[k as ValueType].name,
      })),
    []
  );

  const valueUnits = useMemo(
    () =>
      Object.keys(ValueUnits)
        .map((k) => ({
          id: k,
          name: ValueUnits[k as ValueUnit].name,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    []
  );

  const onChangeValueType = useCallback(
    (t: ValueType) => {
      onChange({
        valueType: t,
        valueUnit:
          valueType === "number" && t !== "number"
            ? undefined
            : t === "number" && valueType !== "number"
            ? "piece"
            : valueUnit,
      });
    },
    [onChange, valueType, valueUnit]
  );

  return (
    <div>
      <TextFieldWithSpeech
        disabled={mode === "edit"}
        autoFocus={mode === "create"}
        margin="dense"
        id="attributeId"
        label="Attribut"
        value={attributeId || ""}
        errorData={errorData.attributeId}
        onChange={(s) => onChange({ attributeId: s })}
        fullWidth
        variant="standard"
      />
      <TextFieldWithSpeech
        autoFocus={mode === "edit"}
        margin="dense"
        id="name"
        label="Name"
        value={name || ""}
        errorData={errorData.name}
        onChange={(s) => {
          onChange({ name: s });
        }}
        fullWidth
        variant="standard"
      />
      <TextField
        margin="dense"
        id="valueType"
        select
        label="Datentyp"
        value={valueType || ""}
        onChange={(event) => {
          isValueType(event.target.value) &&
            onChangeValueType(event.target.value);
        }}
        helperText="Bitte wählen Sie eine Zähleinheit aus"
        fullWidth
        variant="standard"
      >
        {valueTypes.map((t) => (
          <MenuItem key={t.id} value={t.id}>
            {`${t.id} (${t.name})`}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        disabled={valueType !== "number"}
        margin="dense"
        id="valueUnit"
        select
        label="Einheit"
        value={valueUnit || ""}
        onChange={(event) => {
          isValueUnit(event.target.value) &&
            onChange({ valueUnit: event.target.value });
        }}
        helperText={
          valueType === "number"
            ? "Bitte wählen Sie eine Einheit aus"
            : undefined
        }
        fullWidth
        variant="standard"
      >
        {valueUnits.map((t) => (
          <MenuItem key={t.id} value={t.id}>
            {`${t.id} (${t.name})`}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
};

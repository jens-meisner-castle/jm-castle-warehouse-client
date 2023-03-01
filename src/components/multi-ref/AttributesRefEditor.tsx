import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { AttributeValue } from "jm-castle-warehouse-types/build";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import { AttributeRow, AttributeValues } from "../../types/RowTypes";
import { AttributeValueField } from "../attribute/AttributeValueField";
import { AttributeRefAutocomplete } from "../autocomplete/AttributeRefAutocomplete";

const addAttribute = (attribute: AttributeRow, values: AttributeValues) => {
  values[attribute.attributeId] = null;
};

export interface AttributesRefEditorProps {
  values: AttributeValues | undefined;
  onChange: (attributes: AttributeValues | undefined) => void;
  attributes: AttributeRow[];
}

export const AttributesRefEditor = (props: AttributesRefEditorProps) => {
  const { attributes, onChange, values } = props;
  const theme = useTheme();

  const iconButtonStyle: CSSProperties = { padding: 4 };

  const [attributeToAdd, setAttributeToAdd] = useState<
    AttributeRow | null | undefined
  >(undefined);

  const handleAddAttribute = useCallback(
    (row: AttributeRow | undefined | null) => {
      if (!row) return;
      const newAttributes = values ? { ...values } : {};
      !newAttributes[row.attributeId] && addAttribute(row, newAttributes);
      onChange(Object.keys(newAttributes).length ? newAttributes : undefined);
      setAttributeToAdd(undefined);
    },
    [onChange, values]
  );

  const handleRemoveAttribute = useCallback(
    (row: AttributeRow) => {
      const newAttributes = values ? { ...values } : {};
      delete newAttributes[row.attributeId];
      onChange(Object.keys(newAttributes).length ? newAttributes : undefined);
    },
    [onChange, values]
  );

  const handleChangedAttributeValue = useCallback(
    (v: AttributeValue, row: AttributeRow) => {
      const newAttributes = values ? { ...values } : {};
      newAttributes[row.attributeId] = v;
      onChange(Object.keys(newAttributes).length ? newAttributes : undefined);
    },
    [onChange, values]
  );

  const currentAttributeRowsWithValue = useMemo(() => {
    const rowsWithValue: {
      row: AttributeRow;
      value: number | string | boolean | undefined | null;
    }[] = [];
    if (values) {
      Object.keys(values).forEach((k) => {
        const row = attributes.find((d) => d.attributeId === k);
        const value = values[k];
        row && rowsWithValue.push({ row, value });
      });
    }
    return rowsWithValue;
  }, [values, attributes]);

  const notSelectedAttributeRows = useMemo(() => {
    const notSelectedRows: AttributeRow[] = [];
    const currentKeys = Object.keys(values || {});
    attributes.forEach(
      (row) =>
        !currentKeys.includes(row.attributeId) && notSelectedRows.push(row)
    );
    return notSelectedRows;
  }, [attributes, values]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Typography>{"Attribute"}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Typography>
          {attributes?.length ? (
            "Verwenden Sie die Schaltflächen, um Attribute hinzuzufügen oder zu entfernen."
          ) : (
            <span style={{ color: theme.palette.warning.main }}>
              {
                "Es sind keine Attribute vorhanden. Sie müssen zuerst ein Attribut anlegen."
              }
            </span>
          )}
        </Typography>
      </Grid>
      {currentAttributeRowsWithValue.map((data) => {
        const { row, value } = data;
        const { attributeId, valueType, valueUnit } = row;
        const label = `${attributeId} (${valueUnit || valueType})`;
        return (
          <Grid item key={attributeId}>
            <AttributeValueField
              margin="dense"
              id={attributeId}
              label={label}
              attribute={row}
              onChange={(v) => handleChangedAttributeValue(v, row)}
              value={value}
              fullWidth
              variant="standard"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Attribut entfernen">
                    <IconButton
                      style={iconButtonStyle}
                      onClick={() => handleRemoveAttribute(row)}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
        );
      })}
      <Grid item width="100%">
        <Grid
          container
          direction="row"
          alignItems="flex-end"
          alignContent="end"
        >
          <Grid item xs={10}>
            <AttributeRefAutocomplete
              style={{ minWidth: 300 }}
              label="Attribut hinzufügen"
              attributes={notSelectedAttributeRows}
              value={attributeToAdd}
              fullWidth
              onChange={setAttributeToAdd}
              variant="standard"
              margin="dense"
            />
          </Grid>
          <Grid item xs={2}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "flex-end",
                justifyItems: "flex-end",
              }}
            >
              <Button
                style={{ marginBottom: 4 }}
                disabled={!attributeToAdd}
                onClick={() => handleAddAttribute(attributeToAdd)}
                variant="contained"
              >
                <AddIcon />
              </Button>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import { Tooltip } from "@mui/material";
import { CSSProperties } from "react";
import { OrderElement } from "../../types/Types";

export interface ColumnLabelProps<T> {
  label: string;
  orderElement?: OrderElement<T>;
  order?: OrderElement<T>[];
  onClick?: (field: keyof T & string) => void;
}

export const ColumnLabel = <T,>(props: ColumnLabelProps<T>) => {
  const { label, orderElement, order, onClick } = props;
  const { direction, field } = orderElement || {};
  const buttonStyle: CSSProperties = {
    textTransform: "none",
    padding: 0,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  };

  return order ? (
    direction === "ascending" ? (
      <Tooltip title="Sortierung ändern (aktuell aufsteigend)">
        <div
          style={buttonStyle}
          onClick={() => field && onClick && onClick(field)}
        >
          {label}
          <NorthIcon style={{ width: 16, height: 16 }} />
        </div>
      </Tooltip>
    ) : direction === "descending" ? (
      <Tooltip title="Sortierung ändern (aktuell absteigend)">
        <div
          style={buttonStyle}
          onClick={() => field && onClick && onClick(field)}
        >
          {label}
          <SouthIcon style={{ width: 16, height: 16 }} />
        </div>
      </Tooltip>
    ) : (
      <Tooltip title="Nach dieser Spalte sortieren">
        <div
          style={buttonStyle}
          onClick={() => field && onClick && onClick(field)}
        >
          {label}
          <div style={{ width: 16, height: 16 }} />
        </div>
      </Tooltip>
    )
  ) : (
    <div>{label}</div>
  );
};

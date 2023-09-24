import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { TableStatus } from "jm-castle-types/build";
import { useState } from "react";

export interface TableStatusComponentProps {
  status: TableStatus | undefined;
  targetStatus: TableStatus | undefined;
}

export const TableStatusComponent = (props: TableStatusComponentProps) => {
  const { status, targetStatus } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const { name, isCreated, columns } = status || {};

  const { columns: targetColumns } = targetStatus || {};

  const isEqualToTarget =
    isCreated &&
    columns &&
    targetColumns &&
    columns.length === targetColumns.length;

  const currentColumnsCount = columns ? columns.length : 0;
  const targetColumnsCount = targetColumns ? targetColumns.length : 0;

  const summaryText = isEqualToTarget
    ? `${columns.length} Spalten`
    : isCreated
    ? `${currentColumnsCount} von ${targetColumnsCount}`
    : "missing";

  return (
    <Accordion
      expanded={isExpanded}
      onChange={(event, expanded) => setIsExpanded(expanded)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>{name}</Typography>
        <Typography
          sx={{
            color: isEqualToTarget ? "text.secondary" : "error.main",
            marginLeft: 1,
          }}
        >
          {summaryText}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <>
          {columns?.map((c) => {
            const targetColumn = targetColumns?.find(
              (tc) => tc.name === c.name
            );
            return (
              <div key={c.name}>
                <Typography
                  component={"span"}
                >{`{name: "${c.name}",`}</Typography>
                <Typography
                  sx={{ color: "text.secondary", marginLeft: 1 }}
                  component={"span"}
                >{`type: "${c.type}",`}</Typography>
                <Typography
                  sx={{ color: "text.secondary", marginLeft: 1 }}
                  component={"span"}
                >
                  {targetColumn?.autoIncrement
                    ? `autoIncrement: ${targetColumn.autoIncrement}}`
                    : "}"}
                </Typography>
              </div>
            );
          })}
        </>
      </AccordionDetails>
    </Accordion>
  );
};

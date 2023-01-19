import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Grid, IconButton, Tooltip } from "@mui/material";
import { DateTime, DurationLike } from "luxon";
import { useCallback } from "react";
import { DateTimeField } from "../components/DateTimeField";
import { getNewFilter } from "../utils/Filter";
import { TimeintervalFilter } from "./Types";

export interface TimeFilterComponentProps {
  filter: TimeintervalFilter;
  onChange?: (filter: TimeintervalFilter) => void;
}

export const TimeFilterComponent = (props: TimeFilterComponentProps) => {
  const { filter, onChange } = props;
  const { from, to } = filter;
  const setNewTimeInterval = useCallback(
    (from?: DateTime, to?: DateTime) => {
      const newFilter = getNewFilter(filter, from, to);
      onChange && newFilter && onChange(newFilter);
    },
    [filter, onChange]
  );

  const moveInterval = useCallback(
    (duration: DurationLike) => {
      const newFilter = getNewFilter(
        filter,
        filter.from.plus(duration),
        filter.to.plus(duration)
      );
      onChange && newFilter && onChange(newFilter);
    },
    [filter, onChange]
  );

  const handleNewDatePickerFrom = useCallback(
    (value: DateTime) => value.isValid && setNewTimeInterval(value, undefined),
    [setNewTimeInterval]
  );

  const handleNewDatePickerTo = useCallback(
    (value: DateTime) => value.isValid && setNewTimeInterval(undefined, value),
    [setNewTimeInterval]
  );

  return (
    <>
      <Grid container direction="row">
        <Grid item>
          <DateTimeField
            value={from}
            level="minute"
            onChange={handleNewDatePickerFrom}
          />
        </Grid>
        <Grid item>
          <DateTimeField
            value={to}
            level="minute"
            onChange={handleNewDatePickerTo}
          />
        </Grid>
        <Grid item>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Tooltip title={"Intervall verschieben: + 1 Tag"}>
              <IconButton onClick={() => moveInterval({ days: 1 })}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Intervall verschieben: - 1 Tag"}>
              <IconButton onClick={() => moveInterval({ days: -1 })}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Intervall setzen: [vor 7 Tagen, jetzt]"}>
              <IconButton
                onClick={() =>
                  setNewTimeInterval(
                    DateTime.now().minus({ days: 7 }).startOf("day"),
                    DateTime.now()
                  )
                }
              >
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

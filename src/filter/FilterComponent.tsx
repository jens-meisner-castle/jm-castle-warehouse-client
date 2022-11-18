import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Box, Grid, IconButton, TextField, Tooltip } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { CalendarOrClockPickerView } from "@mui/x-date-pickers/internals/models";
import { DateTime, DurationLike } from "luxon";
import { useCallback, useMemo } from "react";
import { getNewFilter } from "../utils/Filter";
import { getDateFormat } from "../utils/Format";
import { TimeintervalFilter } from "./Types";

const handleChangeDatePickerIgnored = (value: DateTime | null) =>
  1 > 2 && console.error("never", value);

export interface FilterComponentProps {
  filter: TimeintervalFilter;
  onChange?: (filter: TimeintervalFilter) => void;
}

export const FilterComponent = (props: FilterComponentProps) => {
  const { filter, onChange } = props;
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
    (value: DateTime | null) =>
      value && value.isValid && setNewTimeInterval(value, undefined),
    [setNewTimeInterval]
  );
  const handleNewDatePickerTo = useCallback(
    (value: DateTime | null) =>
      value && value.isValid && setNewTimeInterval(undefined, value),
    [setNewTimeInterval]
  );
  const pickerViews = useMemo<CalendarOrClockPickerView[]>(
    () => ["day", "hours", "minutes"],
    []
  );

  return (
    <>
      <Grid container direction="row">
        <Grid item>
          <DateTimePicker
            value={filter.from}
            inputFormat={getDateFormat("minute")}
            ampmInClock={false}
            ampm={false}
            views={pickerViews}
            onChange={handleChangeDatePickerIgnored}
            onAccept={handleNewDatePickerFrom}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item>
          <DateTimePicker
            value={filter.to}
            inputFormat={getDateFormat("minute")}
            ampmInClock={false}
            ampm={false}
            views={pickerViews}
            onChange={handleChangeDatePickerIgnored}
            onAccept={handleNewDatePickerTo}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item alignContent={"center"}>
          <Box
            style={{
              display: "flex",
              alignContent: "center",
              height: "100%",
            }}
          >
            <Tooltip title={"Push the interval 1 hour into the future."}>
              <IconButton onClick={() => moveInterval({ hours: 1 })}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Push the interval 1 hour into the past."}>
              <IconButton onClick={() => moveInterval({ hours: -1 })}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Set the interval to [-7 days, now]."}>
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
          </Box>
        </Grid>
        <Grid item alignContent={"center"}>
          <Box
            style={{
              display: "flex",
              alignContent: "center",
              height: "100%",
            }}
          >
            <Tooltip title={"Push the interval 1 minute into the future."}>
              <IconButton onClick={() => moveInterval({ minutes: 1 })}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Push the interval 1 minute into the past."}>
              <IconButton onClick={() => moveInterval({ minutes: -1 })}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Set the interval to [yesterday, now]."}>
              <IconButton
                onClick={() =>
                  setNewTimeInterval(
                    DateTime.now().minus({ days: 1 }).startOf("day"),
                    DateTime.now()
                  )
                }
              >
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

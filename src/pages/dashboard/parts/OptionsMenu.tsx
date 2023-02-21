import { Checkbox, FormControlLabel, Menu, MenuItem } from "@mui/material";
import { useCallback } from "react";
import { PageOptions } from "./OptionsComponent";

export interface OptionsMenuProps {
  options: PageOptions;
  anchorEl: Element | null;
  onChange: (newOptions: Partial<PageOptions>) => void;
  onClose: () => void;
}

export const OptionsMenu = (props: OptionsMenuProps) => {
  const { options, onChange, anchorEl, onClose } = props;
  const { isIncomingHistoryVisible, isMasterdataChangesVisible } = options;
  const isMenuOpen = Boolean(anchorEl);
  const handleNewOptions = useCallback(
    (newOptions: Partial<PageOptions>) => {
      onChange(newOptions);
    },
    [onChange]
  );

  return (
    <Menu open={isMenuOpen} onClose={onClose} anchorEl={anchorEl}>
      <MenuItem>
        <FormControlLabel
          label={"Stammdaten"}
          control={
            <Checkbox
              onChange={(event, checked) =>
                handleNewOptions({ isMasterdataChangesVisible: checked })
              }
              checked={isMasterdataChangesVisible || false}
            />
          }
        ></FormControlLabel>
      </MenuItem>
      <MenuItem>
        <FormControlLabel
          label={"Wareneingänge"}
          control={
            <Checkbox
              onChange={(event, checked) =>
                handleNewOptions({ isIncomingHistoryVisible: checked })
              }
              checked={isIncomingHistoryVisible || false}
            />
          }
        ></FormControlLabel>
      </MenuItem>
    </Menu>
  );
};

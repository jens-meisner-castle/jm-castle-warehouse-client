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
  const { chartWidthFactor, isTableVisible } = options;
  const isMenuOpen = Boolean(anchorEl);
  const handleNewOptions = useCallback(
    (newOptions: Partial<PageOptions>) => {
      onChange(newOptions);
    },
    [onChange]
  );

  return (
    <>
      <Menu open={isMenuOpen} onClose={onClose} anchorEl={anchorEl}>
        <MenuItem>
          <FormControlLabel
            label={"Table"}
            control={
              <Checkbox
                onChange={(event, checked) =>
                  handleNewOptions({ isTableVisible: checked })
                }
                checked={isTableVisible}
              />
            }
          ></FormControlLabel>
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            label={"Chart width x1"}
            control={
              <Checkbox
                onChange={() => handleNewOptions({ chartWidthFactor: 1 })}
                checked={chartWidthFactor === 1}
              />
            }
          ></FormControlLabel>
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            label={"Chart width x2"}
            control={
              <Checkbox
                onChange={() => handleNewOptions({ chartWidthFactor: 2 })}
                checked={chartWidthFactor === 2}
              />
            }
          ></FormControlLabel>
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            label={"Chart width x3"}
            control={
              <Checkbox
                onChange={() => handleNewOptions({ chartWidthFactor: 3 })}
                checked={chartWidthFactor === 3}
              />
            }
          ></FormControlLabel>
        </MenuItem>
      </Menu>
    </>
  );
};

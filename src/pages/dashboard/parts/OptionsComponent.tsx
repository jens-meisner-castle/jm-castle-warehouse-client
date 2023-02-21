import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { Button, Grid } from "@mui/material";
import { MouseEventHandler, useState } from "react";
import { OptionsMenu } from "./OptionsMenu";

export interface PageOptions {
  isIncomingHistoryVisible: boolean;
  isMasterdataChangesVisible: boolean;
}

export const defaultOptions: PageOptions = {
  isIncomingHistoryVisible: true,
  isMasterdataChangesVisible: true,
};

export const getNewOptions = (previous: Partial<PageOptions>) => {
  return { ...defaultOptions, ...previous };
};

export interface OptionsComponentProps {
  options: PageOptions;
  onChange: (newOptions: Partial<PageOptions>) => void;
}

export const OptionsComponent = (props: OptionsComponentProps) => {
  const { options, onChange } = props;
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isMenuOpen = Boolean(menuAnchorEl);
  const openMenu: MouseEventHandler<HTMLButtonElement> = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      {isMenuOpen && (
        <OptionsMenu
          options={options}
          onChange={onChange}
          onClose={handleMenuClose}
          anchorEl={menuAnchorEl}
        />
      )}
      <Grid container direction="row" alignContent={"center"}>
        <Grid item>
          <Button variant="contained" onClick={openMenu}>
            <SettingsApplicationsIcon />
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

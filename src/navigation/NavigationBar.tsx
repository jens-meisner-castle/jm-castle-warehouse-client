import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Toolbar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ToolbarLink } from "jm-castle-components/build";
import {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import { usePages } from "./Pages";

export const NavigationBar = () => {
  const pages = usePages();
  const [anchorElNav, setAnchorElNav] = useState<HTMLButtonElement | null>(
    null
  );
  const pagesDisplay = useMemo(() => {
    const display: {
      to: string;
      label: string;
      icon: ReactElement | undefined;
    }[] = [];
    pages.forEach((page) => {
      display.push({
        label: page.label,
        to: page.to,
        icon: page.icon ? page.icon({ marginTop: 4 }) : undefined,
      });
    });
    return display;
  }, [pages]);

  const isDisplayedRight = useCallback(
    (page: typeof pagesDisplay[0]) => page.to === "/" || page.to === "/login",
    []
  );

  const handleOpenNavMenu: MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", lg: "none" } }}>
            <IconButton size="large" onClick={handleOpenNavMenu}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
          >
            {pagesDisplay.map((page) => (
              <MenuItem key={page.to} onClick={handleCloseNavMenu}>
                <ToolbarLink
                  key={page.to}
                  to={page.to}
                  label={page.label}
                  icon={page.icon}
                  variant="h6"
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    textDecoration: "none",
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
          <Box sx={{ flexGrow: 1, display: { xs: "none", lg: "flex" } }}>
            {pagesDisplay
              .filter((page) => !isDisplayedRight(page))
              .map((page) => (
                <ToolbarLink
                  key={page.to}
                  to={page.to}
                  label={page.label}
                  icon={page.icon}
                  iconOnly
                  variant="h6"
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    textDecoration: "none",
                  }}
                />
              ))}
          </Box>
          <Box
            sx={{ flexGrow: 1, display: { xs: "none", lg: "flex" } }}
            justifyContent="flex-end"
          >
            {pagesDisplay
              .filter((page) => isDisplayedRight(page))
              .map((page) => (
                <ToolbarLink
                  key={page.to}
                  to={page.to}
                  label={page.label}
                  icon={page.icon}
                  iconOnly
                  variant="h6"
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    textDecoration: "none",
                  }}
                />
              ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

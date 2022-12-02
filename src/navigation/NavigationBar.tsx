import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Toolbar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MouseEventHandler, useState } from "react";
import { ToolbarLink } from "./ToolbarLink";

const pages = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/masterdata", label: "Masterdata" },
  { to: "/database-test", label: "DB-Test" },
  { to: "/system", label: "System" },
  { to: "/system-setup", label: "Setup" },
  { to: "/help", label: "Help" },
];

export const NavigationBar = () => {
  const [anchorElNav, setAnchorElNav] = useState<HTMLButtonElement | null>(
    null
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
            {pages.map((page) => (
              <MenuItem key={page.to} onClick={handleCloseNavMenu}>
                <ToolbarLink
                  key={page.to}
                  to={page.to}
                  label={page.label}
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
            {pages.map((page) => (
              <ToolbarLink
                key={page.to}
                to={page.to}
                label={page.label}
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

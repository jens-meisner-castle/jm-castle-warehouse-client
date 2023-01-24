import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import { UserRole } from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useUserRoles } from "../auth/AuthorizationProvider";

export interface Page {
  index: number;
  neededRole: UserRole | "none";
  to: string;
  label: string;
  icon?: (style?: React.CSSProperties) => React.ReactElement;
}
export const allPages: Record<string, Page> = {
  home: {
    to: "/",
    label: "Home",
    index: 0,
    neededRole: "none",
    icon: (style) => <HomeIcon style={style} />,
  },
  dashboard: {
    to: "/dashboard",
    label: "Dashboard",
    index: 1,
    neededRole: "internal",
  },
  history: {
    to: "/history",
    label: "History",
    index: 2,
    neededRole: "internal",
  },
  stock: {
    to: "/stock",
    label: "Bestand",
    index: 3,
    neededRole: "internal",
  },
  masterdata: {
    to: "/masterdata",
    label: "Stammdaten",
    index: 4,
    neededRole: "internal",
  },
  usecase: {
    to: "/usecase",
    label: "Anwendungsfälle",
    index: 5,
    neededRole: "internal",
  },
  databaseTest: {
    to: "/database-test",
    label: "DB-Test",
    index: 6,
    neededRole: "admin",
  },
  systemStatus: {
    to: "/system",
    label: "System",
    index: 7,
    neededRole: "admin",
  },
  systemSetup: {
    to: "/system-setup",
    label: "Setup",
    index: 8,
    neededRole: "admin",
  },
  help: { to: "/help", label: "Help", index: 9, neededRole: "external" },
  login: {
    neededRole: "none",
    to: "/login",
    label: "Login",
    icon: (style) => <PersonIcon style={style} />,
    index: 10,
  },
};

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([allPages.home, allPages.login]);
  const roles = useUserRoles();

  useEffect(() => {
    if (roles) {
      setPages(
        Object.values(allPages)
          .filter(
            (page) =>
              page.neededRole === "none" || roles.includes(page.neededRole)
          )
          .sort((a, b) => a.index - b.index)
      );
    } else {
      setPages([allPages.home, allPages.login]);
    }
  }, [roles]);

  return pages;
};

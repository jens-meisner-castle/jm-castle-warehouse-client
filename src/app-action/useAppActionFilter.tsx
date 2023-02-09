import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { AppAction } from "../components/AppActions";

export const useAppActionFilter = (initialVisible: boolean) => {
  const [isFilterVisible, setIsFilterVisible] = useState(initialVisible);

  const [hookState, setHookState] = useState<{
    filterAction: AppAction;
    isFilterVisible: boolean;
  }>({
    filterAction: {
      label: isFilterVisible ? <FilterAltOff /> : <FilterAlt />,
      tooltip: isFilterVisible ? "Filter ausblenden" : "Filter einblenden",
      onClick: () => setIsFilterVisible((previous) => !previous),
    },
    isFilterVisible,
  });

  useEffect(() => {
    setHookState({
      filterAction: {
        label: isFilterVisible ? <FilterAltOff /> : <FilterAlt />,
        tooltip: isFilterVisible ? "Filter ausblenden" : "Filter einblenden",
        onClick: () => setIsFilterVisible((previous) => !previous),
      },
      isFilterVisible,
    });
  }, [isFilterVisible]);

  return hookState;
};

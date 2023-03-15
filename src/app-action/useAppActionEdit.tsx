import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import { AppAction } from "jm-castle-components/build";
import { useEffect, useState } from "react";

export const useAppActionEdit = (initialActive: boolean) => {
  const [isEditActive, setIsEditActive] = useState(initialActive);

  const [hookState, setHookState] = useState<{
    editAction: AppAction;
    isEditActive: boolean;
    setIsEditActive: typeof setIsEditActive;
  }>({
    editAction: {
      label: isEditActive ? <EditOffIcon /> : <EditIcon />,
      tooltip: isEditActive
        ? "Bearbeitung deaktivieren"
        : "Bearbeitung aktivieren",
      onClick: () => setIsEditActive((previous) => !previous),
    },
    isEditActive,
    setIsEditActive,
  });

  useEffect(() => {
    setHookState({
      editAction: {
        label: isEditActive ? <EditOffIcon /> : <EditIcon />,
        tooltip: isEditActive
          ? "Bearbeitung deaktivieren"
          : "Bearbeitung aktivieren",
        onClick: () => setIsEditActive((previous) => !previous),
      },
      isEditActive,
      setIsEditActive,
    });
  }, [isEditActive]);

  return hookState;
};

import MoveDownIcon from "@mui/icons-material/MoveDown";
import { IconButton, Tooltip } from "@mui/material";

export interface MoveButtonProps {
  tooltip?: string;
  onClick: () => void;
  size?: "small" | "medium" | "large";
}

export const MoveButton = (props: MoveButtonProps) => {
  const { tooltip, onClick, size } = props;

  return tooltip ? (
    <Tooltip title={tooltip}>
      <IconButton size={size} onClick={onClick}>
        <MoveDownIcon />
      </IconButton>
    </Tooltip>
  ) : (
    <IconButton size={size} onClick={onClick}>
      <MoveDownIcon />
    </IconButton>
  );
};

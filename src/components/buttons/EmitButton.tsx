import NorthEastIcon from "@mui/icons-material/NorthEast";
import { IconButton, Tooltip } from "@mui/material";

export interface EmitButtonProps {
  tooltip?: string;
  onClick: () => void;
  size?: "small" | "medium" | "large";
}

export const EmitButton = (props: EmitButtonProps) => {
  const { tooltip, onClick, size } = props;

  return tooltip ? (
    <Tooltip title={tooltip}>
      <IconButton size={size} onClick={onClick}>
        <NorthEastIcon />
      </IconButton>
    </Tooltip>
  ) : (
    <IconButton size={size} onClick={onClick}>
      <NorthEastIcon />
    </IconButton>
  );
};

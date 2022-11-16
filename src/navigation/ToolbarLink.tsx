import { Typography, useTheme } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";
import { Link, LinkProps } from "react-router-dom";

export interface ToolbarLinkProps extends LinkProps {
  to: string;
  label: string;
  variant?: Variant;
}

export const ToolbarLink = (props: ToolbarLinkProps) => {
  const { to, label, variant, ...otherLinkProps } = props;
  const theme = useTheme();
  return (
    <Link
      to={to}
      style={{ textDecorationColor: theme.palette.text.primary }}
      {...otherLinkProps}
    >
      <Typography color={theme.palette.text.primary} variant={variant}>
        {label}
      </Typography>
    </Link>
  );
};

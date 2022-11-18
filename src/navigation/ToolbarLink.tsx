import { Typography, useTheme } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";
import { Link, LinkProps } from "react-router-dom";

export interface ToolbarLinkProps extends LinkProps {
  to: string;
  label: string;
  variant?: Variant;
}

export const ToolbarLink = (props: ToolbarLinkProps) => {
  const { to, label, variant, style, ...otherLinkProps } = props;
  const theme = useTheme();
  const allStyles = style
    ? { ...style, textDecorationColor: theme.palette.text.primary }
    : { textDecorationColor: theme.palette.text.primary };

  return (
    <Link to={to} style={allStyles} {...otherLinkProps}>
      <Typography
        component="span"
        color={theme.palette.text.primary}
        variant={variant}
      >
        {label}
      </Typography>
    </Link>
  );
};

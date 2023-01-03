import { Typography, useTheme } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";
import { Link, LinkProps } from "react-router-dom";

export interface ToolbarLinkProps extends LinkProps {
  to: string;
  label: string;
  icon?: React.ReactElement;
  iconOnly?: boolean;
  variant?: Variant;
}

export const ToolbarLink = (props: ToolbarLinkProps) => {
  const { to, label, icon, iconOnly, variant, style, ...otherLinkProps } =
    props;
  const theme = useTheme();
  const allStyles = style
    ? { ...style, textDecorationColor: theme.palette.text.primary }
    : { textDecorationColor: theme.palette.text.primary };
  const showIconOnly = icon && iconOnly;

  return (
    <Link to={to} style={allStyles} {...otherLinkProps}>
      <div style={{ display: "flex", alignContent: "center" }}>
        {!showIconOnly && (
          <Typography
            component="span"
            color={theme.palette.text.primary}
            variant={variant}
          >
            {label}
          </Typography>
        )}
        {icon && (
          <span
            style={{
              color: theme.palette.text.primary,
              marginLeft: showIconOnly ? 0 : 10,
            }}
          >
            {icon}
          </span>
        )}
      </div>
    </Link>
  );
};

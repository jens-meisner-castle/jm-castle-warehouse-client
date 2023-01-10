import { Typography, useTheme } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";

export interface WwwLinkProps {
  to: string;
  label: string;
  icon?: React.ReactElement;
  iconOnly?: boolean;
  variant?: Variant;
}

export const WwwLink = (props: WwwLinkProps) => {
  const { to, label, icon, iconOnly, variant } = props;
  const theme = useTheme();
  const allStyles = { textDecorationColor: theme.palette.text.primary };
  const showIconOnly = icon && iconOnly;

  return (
    <a href={to} style={allStyles} target="_blank" rel="noreferrer">
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
    </a>
  );
};

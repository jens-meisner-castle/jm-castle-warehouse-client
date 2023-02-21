import { Box, Button, Grid, Tooltip } from "@mui/material";
import { MutableRefObject, ReactElement, useMemo } from "react";
import { ToolbarLink } from "../navigation/ToolbarLink";

export type AppAction = {
  label: string | ReactElement;
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
} & (
  | {
      onClick: () => void;
      elementRef?: MutableRefObject<HTMLButtonElement | null>;
      onClickNavigate?: never;
    }
  | {
      onClickNavigate: { to: string };
      onClick?: never;
      elementRef?: never;
    }
);

export type AppActionProps = {
  actions: AppAction[];
};

export const AppActions = (props: AppActionProps) => {
  const { actions } = props;
  const actionsDisplay = useMemo(() => {
    const display: (AppAction & { icon?: ReactElement })[] = [];
    actions.forEach((action) => {
      display.push({
        ...action,
        label: typeof action.label === "string" ? action.label : "",
        icon: typeof action.label !== "string" ? action.label : undefined,
      });
    });
    return display;
  }, [actions]);

  return (
    <div>
      <Grid container direction="row" alignItems="center">
        {actionsDisplay.map((action, i) => (
          <Grid item key={i}>
            {action.onClick ? (
              action.tooltip ? (
                <Tooltip title={action.tooltip}>
                  <span>
                    <Button
                      ref={action.elementRef}
                      style={{
                        marginLeft: i > 0 ? 10 : 0,
                        display: action.hidden ? "none" : undefined,
                        textTransform: "none",
                      }}
                      variant="contained"
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      {action.icon || action.label}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  ref={action.elementRef}
                  style={{
                    marginLeft: i > 0 ? 10 : 0,
                    display: action.hidden ? "none" : undefined,
                    textTransform: "none",
                  }}
                  variant="contained"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon || action.label}
                </Button>
              )
            ) : (
              <Box
                style={{
                  marginLeft: i > 0 ? 10 : 0,
                  display: action.hidden ? "none" : undefined,
                }}
              >
                <ToolbarLink
                  to={action.onClickNavigate.to}
                  label={typeof action.label === "string" ? action.label : ""}
                  icon={action.icon}
                />
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

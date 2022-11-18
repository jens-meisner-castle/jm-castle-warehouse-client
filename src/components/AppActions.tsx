import { Box, Button, Grid } from "@mui/material";
import { MutableRefObject } from "react";
import { ToolbarLink } from "../navigation/ToolbarLink";

export type AppAction = {
  label: string;
  disabled?: boolean;
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

  return (
    <div style={{ marginBottom: 10, marginTop: 10 }}>
      <Grid container direction="row">
        {actions.map((action, i) => (
          <Grid item key={i}>
            {action.onClick ? (
              <Button
                ref={action.elementRef}
                style={{ marginLeft: i > 0 ? 10 : 0 }}
                variant="contained"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ) : (
              <Box style={{ marginLeft: i > 0 ? 10 : 0 }}>
                <ToolbarLink
                  to={action.onClickNavigate.to}
                  label={action.label}
                />
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

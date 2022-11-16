import { Button, Grid } from "@mui/material";
import { MutableRefObject } from "react";

export interface AppAction {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  elementRef?: MutableRefObject<HTMLButtonElement | null>;
}
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
            <Button
              ref={action.elementRef}
              style={{ marginLeft: i > 0 ? 10 : 0 }}
              variant="contained"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

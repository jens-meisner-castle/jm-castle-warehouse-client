export type FinalActionState<T> =
  | { action: "error-new"; data: T; error: string }
  | { action: "error-edit"; data: T; error: string }
  | { action: "success-new"; data: T; error?: never }
  | { action: "success-edit"; data: T; error?: never };

const getFinalActionState = <T>(
  state: ReducerState<T>
): FinalActionState<T> | undefined => {
  switch (state.action) {
    case "error-new":
      return { action: "error-new", data: state.data, error: state.error };
    case "error-edit":
      return { action: "error-edit", data: state.data, error: state.error };
    case "success-new":
      return { action: "success-new", data: state.data };
    case "success-edit":
      return { action: "success-edit", data: state.data };
    default:
      return undefined;
  }
};

export type ReducerState<T> = { previous?: FinalActionState<T> } & (
  | {
      action: "new";
      data: T;
      error?: never;
    }
  | {
      action: "edit";
      data: T;
      error?: never;
    }
  | { action: "none"; data?: never; error?: never }
  | { action: "accept-new"; data: T; error?: never }
  | { action: "accept-edit"; data: T; error?: never }
  | { action: "error-new"; data: T; error: string }
  | { action: "error-edit"; data: T; error: string }
  | { action: "success-new"; data: T; error?: never }
  | { action: "success-edit"; data: T; error?: never }
);

export type ReducerAction<T> =
  | {
      type: "cancel";
      data?: never;
      error?: never;
    }
  | { type: "new"; data: T; error?: never }
  | { type: "edit"; data: T; error?: never }
  | { type: "accept"; data: T; error?: never }
  | { type: "error"; data: T; error: string }
  | { type: "success"; data: T; error?: never }
  | { type: "reset"; data?: never; error?: never };

export function ActionStateReducer<T>(
  prevState: ReducerState<T>,
  action: ReducerAction<T>
): ReducerState<T> {
  const { type, data, error } = action;

  switch (type) {
    case "new":
      return { action: "new", data };
    case "edit":
      return { action: "edit", data };
    case "cancel":
      return { action: "none" };
    case "accept":
      switch (prevState.action) {
        case "new":
          return { action: "accept-new", data };
        case "edit":
          return { action: "accept-edit", data };
        default:
          return { action: "none" };
      }
    case "error":
      switch (prevState.action) {
        case "accept-new":
          return { action: "error-new", data, error };
        case "accept-edit":
          return { action: "error-edit", data, error };
        default:
          return { action: "none" };
      }
    case "success":
      switch (prevState.action) {
        case "accept-new":
          return { action: "success-new", data };
        case "accept-edit":
          return { action: "success-edit", data };
        default:
          return { action: "none" };
      }
    case "reset":
      return { previous: getFinalActionState(prevState), action: "none" };
    default:
      return prevState;
  }
}

export const getValidInitialAction = (
  s: string | null | undefined
): "new" | "edit" | "duplicate" | "none" => {
  switch (s) {
    case "new":
    case "duplicate":
    case "edit":
    case "none":
      return s;
    default:
      return "none";
  }
};

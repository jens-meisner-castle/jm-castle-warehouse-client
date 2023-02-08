import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  isInventoryState,
  isRelocateState,
  UsecaseData,
  UsecaseState,
} from "../Types";

interface ContextState {
  startUsecase?: (initialState: UsecaseState) => void;
  cancelUsecase?: () => void;
  usecaseState?: UsecaseState;
  updateUsecaseData?: (
    updates: { data: Partial<UsecaseData> } & { id: UsecaseState["id"] }
  ) => void;
}

const initialValue: ContextState = {};

const usecaseContext = createContext<ContextState>(initialValue);
const { Provider } = usecaseContext;

export const UsecaseContextProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [usecaseState, setUsecaseState] = useState<UsecaseState>({
    id: "empty",
    data: undefined,
  });

  const startUsecase = useCallback((initialState: UsecaseState) => {
    setUsecaseState(initialState);
  }, []);

  const updateUsecaseData = useCallback(
    (updates: { data: Partial<UsecaseData> } & { id: UsecaseState["id"] }) => {
      setUsecaseState((previous) => {
        const { id: previousId } = previous;
        if (previousId !== updates.id) return previous;
        switch (previousId) {
          case "inventory":
            return isInventoryState(updates)
              ? { id: previousId, data: { ...previous.data, ...updates.data } }
              : previous;
          case "relocate":
            return isRelocateState(updates)
              ? { id: previousId, data: { ...previous.data, ...updates.data } }
              : previous;
          default: {
            console.error("Bad updateUsecaseData call with: ", updates);
            return previous;
          }
        }
      });
    },
    []
  );

  const cancelUsecase = useCallback(() => {
    setUsecaseState({ id: "empty" });
  }, []);

  const [contextValue, setContextValue] = useState<ContextState>({
    startUsecase,
    cancelUsecase,
    usecaseState,
    updateUsecaseData,
  });

  useEffect(() => {
    setContextValue((previous) =>
      previous.usecaseState === usecaseState
        ? previous
        : { ...previous, usecaseState }
    );
  }, [usecaseState]);

  useEffect(() => {
    setContextValue((previous) =>
      previous.startUsecase === startUsecase
        ? previous
        : { ...previous, startUsecase }
    );
  }, [startUsecase]);

  return <Provider value={contextValue}>{children}</Provider>;
};

export const useStartUsecase = () => {
  const { startUsecase } = useContext(usecaseContext);
  if (!startUsecase) {
    console.error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useStartUsecase."
    );
    throw new Error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useStartUsecase."
    );
  }
  return startUsecase;
};

export const useCancelUsecase = () => {
  const { cancelUsecase } = useContext(usecaseContext);
  if (!cancelUsecase) {
    console.error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useCancelUsecase."
    );
    throw new Error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useCancelUsecase."
    );
  }
  return cancelUsecase;
};

export const useUpdateUsecaseData = () => {
  const { updateUsecaseData } = useContext(usecaseContext);
  if (!updateUsecaseData) {
    console.error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useUpdateUsecaseData."
    );
    throw new Error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useUpdateUsecaseData."
    );
  }
  return updateUsecaseData;
};

export const useUsecaseState = () => {
  const { usecaseState } = useContext(usecaseContext);
  return usecaseState;
};

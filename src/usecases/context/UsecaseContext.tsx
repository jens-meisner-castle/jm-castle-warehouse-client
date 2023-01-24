import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { UsecaseState } from "../Types";

interface ContextState {
  startUsecase?: (initialState: UsecaseState) => void;
  usecaseState?: UsecaseState;
  setUsecaseState?: Dispatch<SetStateAction<UsecaseState>>;
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

  const [contextValue, setContextValue] = useState<ContextState>({
    startUsecase,
    usecaseState,
    setUsecaseState,
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

export const useSetUsecaseState = () => {
  const { setUsecaseState } = useContext(usecaseContext);
  if (!setUsecaseState) {
    console.error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useSetUsecaseState."
    );
    throw new Error(
      "No UsecaseContextProvider in parent hierarchy. Unable to use useSetUsecaseState."
    );
  }
  return setUsecaseState;
};

export const useUsecaseState = () => {
  const { usecaseState } = useContext(usecaseContext);
  return usecaseState;
};

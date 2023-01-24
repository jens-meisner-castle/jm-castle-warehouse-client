import {
  useSetUsecaseState,
  useUsecaseState,
} from "../../../usecases/context/UsecaseContext";
import { InventoryUsecase } from "../../../usecases/inventory/InventoryUsecase";
import { GeneralUsecaseProps } from "../../../usecases/Types";

export type UsecaseDisplayProps = Omit<GeneralUsecaseProps, "setUsecaseState">;

export const UsecaseDisplay = (props: UsecaseDisplayProps) => {
  const { sizeVariant } = props;
  const usecaseState = useUsecaseState();
  const setUsecaseState = useSetUsecaseState();

  const { id, data } = usecaseState || {};

  if (!data) return <></>;
  switch (id) {
    case "inventory":
      return (
        <InventoryUsecase
          setUsecaseState={setUsecaseState}
          sizeVariant={sizeVariant}
          id={id}
          data={data}
        />
      );
    default:
      return <></>;
  }
};

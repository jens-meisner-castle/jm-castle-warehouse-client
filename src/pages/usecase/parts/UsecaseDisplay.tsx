import {
  useCancelUsecase,
  useUpdateUsecaseData,
  useUsecaseState,
} from "../../../usecases/context/UsecaseContext";
import { InventoryUsecase } from "../../../usecases/inventory/InventoryUsecase";
import { RelocateUsecase } from "../../../usecases/relocate/RelocateUsecase";
import { GeneralUsecaseProps } from "../../../usecases/Types";

export type UsecaseDisplayProps = Omit<
  Omit<GeneralUsecaseProps, "cancelUsecase">,
  "updateUsecaseData"
>;

export const UsecaseDisplay = (props: UsecaseDisplayProps) => {
  const { sizeVariant } = props;
  const usecaseState = useUsecaseState();
  const updateUsecaseData = useUpdateUsecaseData();
  const cancelUsecase = useCancelUsecase();

  const { id, data } = usecaseState || {};

  if (!data) return <></>;
  switch (id) {
    case "inventory":
      return (
        <InventoryUsecase
          updateUsecaseData={updateUsecaseData}
          cancelUsecase={cancelUsecase}
          sizeVariant={sizeVariant}
          id={id}
          data={data}
        />
      );
    case "relocate":
      return (
        <RelocateUsecase
          updateUsecaseData={updateUsecaseData}
          cancelUsecase={cancelUsecase}
          sizeVariant={sizeVariant}
          id={id}
          data={data}
        />
      );
    default:
      return <></>;
  }
};

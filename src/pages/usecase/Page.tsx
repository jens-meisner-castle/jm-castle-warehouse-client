import { useHandleExpiredToken } from "../../auth/AuthorizationProvider";
import { SizeVariant } from "../../components/SizeVariant";
import { useUrlSearchParameters } from "../../hooks/useUrlSearchParameters";
import { useWindowSize } from "../../hooks/useWindowSize";
import { UsecaseContextProvider } from "../../usecases/context/UsecaseContext";
import { UsecaseDisplay } from "./parts/UsecaseDisplay";
import { UsecaseStarter } from "./parts/UsecaseStarter";

const sizeVariantForWidth = (width: number): SizeVariant => {
  if (width < 600) return "tiny";
  if (width < 800) return "small";
  if (width < 1100) return "medium";
  return "large";
};

export const Page = () => {
  const { width } = useWindowSize() || {};
  const sizeVariant = width ? sizeVariantForWidth(width) : "tiny";
  const { params } = useUrlSearchParameters();
  const handleExpiredToken = useHandleExpiredToken();

  const { usecase: usecaseArr } = params;

  const usecase = usecaseArr?.length ? usecaseArr[0] : undefined;

  return (
    <UsecaseContextProvider>
      <UsecaseStarter
        handleExpiredToken={handleExpiredToken}
        usecase={usecase}
        params={usecase ? params : undefined}
      />
      <UsecaseDisplay sizeVariant={sizeVariant} />
    </UsecaseContextProvider>
  );
};

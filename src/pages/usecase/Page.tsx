import { SizeVariant } from "../../components/SizeVariant";
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

  return (
    <UsecaseContextProvider>
      <UsecaseStarter />
      <UsecaseDisplay sizeVariant={sizeVariant} />
    </UsecaseContextProvider>
  );
};

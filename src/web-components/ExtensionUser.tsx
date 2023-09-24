import { ReactExtension } from "./ReactExtension";

customElements.define("react-extension", ReactExtension);

export const ExtensionUser = () => {
  return <react-extension payload="just a test" component="HotStuff" />;
};

import { ReactNode, useEffect, useState } from "react";

export interface ExtensionWrapperProps {
  payload: string;
  component: (payload: string) => ReactNode;
}

// @TODO: add JSON.parse(payload); add cache for mui; add context; add login stuff
export const ExtensionWrapper = (props: ExtensionWrapperProps) => {
  const { payload, component } = props;

  console.log("payload", payload);

  const [data, setData] = useState(payload);

  useEffect(() => {
    setData(payload);
  }, [payload]);

  return component(data);
};

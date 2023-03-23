import { msg_subscribe } from "jm-castle-types/build";
import { useEffect, useState } from "react";
import { usePubSubWebsocket } from "./websocket/usePubSubWebsocket";

export interface PubSubStatusExportImportActive {
  state: { exportActive: boolean; importActive: boolean } | undefined;
  error: string | undefined;
}

export const usePubSubExportImportActive = (apiUrl: string) => {
  const [pubSubStatus, setPubSubStatus] =
    useState<PubSubStatusExportImportActive>({
      state: undefined,
      error: undefined,
    });

  const [subscribe] = useState(() =>
    msg_subscribe("/system/export-import-active")
  );
  const { data, error } = usePubSubWebsocket<{
    state: {
      exportActive: boolean;
      importActive: boolean;
    };
  }>(apiUrl, subscribe);

  useEffect(() => {
    setPubSubStatus({ state: data ? data.state : undefined, error });
  }, [data, error]);

  return pubSubStatus;
};

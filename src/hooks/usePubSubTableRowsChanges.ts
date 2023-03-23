import { msg_subscribe } from "jm-castle-types/build";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePubSubWebsocket } from "./websocket/usePubSubWebsocket";

export interface PubSubStatusTableRows {
  state: { changes: { table: string }[] } | undefined;
  error: string | undefined;
}

export const usePubSubTableRowsChanges = (apiUrl: string) => {
  const [pubSubStatus, setPubSubStatus] = useState<PubSubStatusTableRows>({
    state: undefined,
    error: undefined,
  });
  const clearChanges = useCallback((tables: string[]) => {
    setPubSubStatus((previous) => ({
      error: previous.error,
      state: {
        changes: previous.state
          ? previous.state?.changes.filter(
              (change) => !tables.includes(change.table)
            )
          : [],
      },
    }));
  }, []);

  const pubSubState = useMemo(
    () => ({
      state: pubSubStatus.state,
      error: pubSubStatus.error,
      clearChanges,
    }),
    [pubSubStatus, clearChanges]
  );
  const [subscribe] = useState(() =>
    msg_subscribe("/system/table-rows-change")
  );
  const { data, error } = usePubSubWebsocket<{ changes: { table: string }[] }>(
    apiUrl,
    subscribe
  );

  useEffect(() => {
    setPubSubStatus({ state: data, error });
  }, [data, error]);

  return pubSubState;
};

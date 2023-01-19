import {
  ApiServiceResponse,
  ErrorCode,
  Row_Receiver,
  UnknownErrorCode,
  UpdateResponse,
} from "jm-castle-warehouse-types/build";
import { useEffect, useState } from "react";
import { useAuthorizationToken } from "../auth/AuthorizationProvider";
import { defaultFetchOptions } from "./options/Utils";

export const useReceiverUpdate = (
  apiUrl: string,
  receiver: Row_Receiver | undefined,
  updateIndicator: number,
  handleExpiredToken?: (errorCode: ErrorCode | undefined) => void
) => {
  const [queryStatus, setQueryStatus] = useState<
    | ApiServiceResponse<UpdateResponse<Row_Receiver>>
    | ApiServiceResponse<undefined>
  >({
    response: undefined,
  });
  const token = useAuthorizationToken();

  useEffect(() => {
    if (!updateIndicator) {
      return setQueryStatus({ response: undefined });
    }
    if (!receiver) {
      return setQueryStatus((previous) =>
        previous.error || previous.response ? { response: undefined } : previous
      );
    }
    const options = defaultFetchOptions(token);
    options.method = "POST";
    options.body = JSON.stringify(receiver);
    options.headers = options.headers
      ? { ...options.headers, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
    const url = `${apiUrl}/receiver/update?receiver_id=${receiver.receiver_id}`;
    setQueryStatus({ response: undefined });
    fetch(url, options)
      .then((response) => {
        response
          .json()
          .then((obj: ApiServiceResponse<UpdateResponse<Row_Receiver>>) => {
            const { response, error, errorDetails, errorCode } = obj || {};
            if (handleExpiredToken) {
              handleExpiredToken(errorCode);
            }
            if (error) {
              return setQueryStatus({ error, errorCode, errorDetails });
            }
            const { result } = response || {};
            if (result) {
              return setQueryStatus({
                response: { result },
              });
            }
            return setQueryStatus({
              errorCode: UnknownErrorCode,
              error: `Received no error and undefined result.`,
            });
          });
      })
      .catch((error) => {
        setQueryStatus({
          errorCode: UnknownErrorCode,
          error: error.toString(),
        });
      });
  }, [apiUrl, updateIndicator, receiver, token, handleExpiredToken]);
  return queryStatus;
};

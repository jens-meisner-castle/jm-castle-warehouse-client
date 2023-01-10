import { Grid } from "@mui/material";
import { ErrorCode } from "jm-castle-warehouse-types/build";
import { useMemo } from "react";
import { ErrorDisplay } from "./ErrorDisplay";

export interface ErrorData {
  error?: string;
  errorCode?: ErrorCode;
  errorDetails?: Record<string, unknown>;
}

export interface ErrorDisplaysProps {
  results: Record<string, ErrorData>;
}

export const ErrorDisplays = (props: ErrorDisplaysProps) => {
  const { results } = props;
  const errorArr = useMemo(() => {
    const newArr: (ErrorData & { key: string })[] = [];
    Object.keys(results).forEach((k) => {
      if (results[k].error) {
        newArr.push({ ...results[k], key: k });
      }
    });
    return newArr;
  }, [results]);

  return (
    <Grid container direction="column">
      {errorArr.map((data) => (
        <Grid item key={data.key}>
          <ErrorDisplay
            dataLabel={data.key}
            error={data.error}
            errorCode={data.errorCode}
            errorDetails={data.errorDetails}
          ></ErrorDisplay>
        </Grid>
      ))}
    </Grid>
  );
};

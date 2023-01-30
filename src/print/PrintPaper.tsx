import { Grid } from "@mui/material";
import { CSSProperties, PropsWithChildren, useMemo } from "react";

export const pageFormats = {
  "din-a4-portrait": { width: 210, height: 297, name: "DIN A4 Portrait" },
};

/**
 * @param margin values in mm
 */
export type PrintPaperProps = PropsWithChildren & {
  format: keyof typeof pageFormats;
  margin: number | { top: number; bottom: number; left: number; right: number };
};

export const PrintPaper = (props: PrintPaperProps) => {
  const { format, children, margin } = props;
  const selectedFormat = pageFormats[format];

  const marginTop = typeof margin === "number" ? margin : margin.top;
  const marginBottom = typeof margin === "number" ? margin : margin.bottom;
  const marginLeft = typeof margin === "number" ? margin : margin.left;
  const marginRight = typeof margin === "number" ? margin : margin.right;
  const marginColor = "rgb(255 255 255 / 80%)";

  const pageStyle: CSSProperties = useMemo(
    () => ({
      width: `${selectedFormat.width}mm`,
      height: `${selectedFormat.height}mm`,
      backgroundColor: "lightGray",
      ariaDescription: "Die komplette Druckseite.",
    }),
    [selectedFormat]
  );
  // Inhalt: page - margin
  const topStyle: CSSProperties = useMemo(() => {
    return {
      width: `${selectedFormat.width}mm`,
      height: `${marginTop}mm`,
      backgroundColor: marginColor,
      ariaDescription: "Der obere Rand der Druckseite.",
    };
  }, [marginTop, selectedFormat]);
  const leftStyle: CSSProperties = useMemo(() => {
    return {
      width: `${marginLeft}mm`,
      backgroundColor: marginColor,
      ariaDescription: "Der linke Rand der Druckseite.",
    };
  }, [marginLeft]);
  const rightStyle: CSSProperties = useMemo(() => {
    return {
      width: `${marginRight}mm`,
      backgroundColor: marginColor,
      ariaDescription: "Der rechte Rand der Druckseite.",
    };
  }, [marginRight]);
  const bottomStyle: CSSProperties = useMemo(() => {
    return {
      width: `${selectedFormat.width}mm`,
      height: `${marginBottom}mm`,
      backgroundColor: marginColor,
      ariaDescription: "Der untere Rand der Druckseite.",
    };
  }, [marginBottom, selectedFormat]);

  const contentStyle: CSSProperties = useMemo(() => {
    return {
      width: `${selectedFormat.width - marginLeft - marginRight}mm`,
      height: `${selectedFormat.height - marginTop - marginBottom}mm`,
      backgroundColor: "white",
      ariaDescription: "Der verfügbare Bereich auf einer Druckseite",
    };
  }, [selectedFormat, marginTop, marginBottom, marginLeft, marginRight]);

  return (
    <Grid container style={pageStyle}>
      <Grid item style={topStyle}></Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item style={leftStyle}></Grid>
          <Grid item style={contentStyle}>
            {children}
          </Grid>
          <Grid item style={rightStyle}></Grid>
        </Grid>
      </Grid>
      <Grid item style={bottomStyle}></Grid>
    </Grid>
  );
};

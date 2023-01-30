import { Grid, ThemeProvider } from "@mui/material";
import { ReactNode, useMemo } from "react";
import { useCellLayout } from "../../../../print/CellLayout";
import { PrintDialog } from "../../../../print/PrintDialog";
import { StoreSectionStickOnLabel } from "../../../../components/print/StoreSectionStickOnLabel";
import { muiThemeLight } from "../../../../theme/MuiTheme";
import { StoreSectionRow } from "../../../../types/RowTypes";

export interface PrintSectionLabelDialogProps {
  sections: StoreSectionRow[];
  onClose: () => void;
}

export const PrintSectionLabelDialog = (
  props: PrintSectionLabelDialogProps
) => {
  const { onClose, sections } = props;

  const sectionNodes = useMemo(() => {
    const nodes: ReactNode[] = [];
    sections.forEach((section) =>
      nodes.push(
        <StoreSectionStickOnLabel key={section.sectionId} section={section} />
      )
    );
    return nodes;
  }, [sections]);

  const printPortions = useCellLayout({
    countOfColumns: 2,
    countOfRows: 4,
    parts: sectionNodes,
  });

  return (
    <ThemeProvider theme={muiThemeLight}>
      <PrintDialog
        onClose={onClose}
        paperFormat="din-a4-portrait"
        paperMargin={5}
      >
        {printPortions.map((portion, n) => (
          <Grid
            key={n}
            container
            direction="column"
            style={{ width: "100%", height: "100%" }}
          >
            {portion.rows.map((row, i) => (
              <Grid item key={i} style={{ height: portion.rowHeight }}>
                <Grid
                  container
                  direction="row"
                  style={{ height: "100%" }}
                  alignContent="center"
                >
                  {row.cells.map((cell, j) => (
                    <Grid
                      item
                      key={j}
                      style={{ width: portion.columnWidth, height: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignContent: "center",
                          alignItems: "center",
                          width: "100%",
                          height: "100%",
                          borderStyle: "dotted",
                          borderWidth: 1,
                        }}
                      >
                        {cell}
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        ))}
      </PrintDialog>
    </ThemeProvider>
  );
};

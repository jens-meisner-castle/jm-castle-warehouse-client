import { Print } from "@mui/icons-material";
import { Fab, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Fragment, ReactNode, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { pageFormats, PrintPaper, PrintPaperProps } from "./PrintPaper";

export type PrintDialogProps = {
  paperFormat: PrintPaperProps["format"];
  paperMargin: PrintPaperProps["margin"];
  onClose: () => void;
  children: ReactNode[];
};

/**
 * Puts each child on one page.
 * @param props
 * @returns
 */
export const PrintDialog = (props: PrintDialogProps) => {
  const { paperFormat, children, onClose, paperMargin } = props;

  const docRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    onBeforeGetContent: () => {
      return new Promise<void>((resolve, reject) => {
        docRef.current && resolve();
        !docRef.current && reject(new Error("No current document reference."));
      });
    },
    content: () => docRef.current,
  });

  return (
    <Dialog fullScreen maxWidth="lg" open={true} onClose={onClose}>
      <DialogTitle>{`Drucken: Format: ${pageFormats[paperFormat].name}, Anzahl Seiten: ${children.length}`}</DialogTitle>
      <DialogActions style={{ justifyContent: "start" }}>
        {handlePrint && (
          <Tooltip title={"Drucken"}>
            <Fab color="primary" onClick={() => handlePrint()}>
              <Print />
            </Fab>
          </Tooltip>
        )}
        <Button onClick={onClose}>{"Abbrechen"}</Button>
      </DialogActions>
      <DialogContent>
        <div ref={docRef}>
          {children.map((child, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <div
                  key={`page-break-${i}`}
                  style={{ pageBreakAfter: "always" }}
                />
              )}
              <PrintPaper
                key={`paper-${i}`}
                format={paperFormat}
                margin={paperMargin}
              >
                {child}
              </PrintPaper>
            </Fragment>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{"Abbrechen"}</Button>
      </DialogActions>
    </Dialog>
  );
};

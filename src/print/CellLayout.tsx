import { ReactNode, useMemo } from "react";

export type CellLayoutProps = {
  countOfRows: number;
  countOfColumns: number;
  parts: ReactNode[];
};

export interface CellLayout {
  rows: { cells: ReactNode[] }[];
  rowHeight: string;
  columnWidth: string;
}

/**
 * Verteilt die parts auf Portionen. Jede Portion enthält eine Zeilen mit Anzahl countOfRows.
 * Jede Zeile enthält Zellen mit Anzahl countOfColumns
 * @param props
 * @returns Portionen, die die aufgeteilzen parts enthalten
 */
export const useCellLayout = (props: CellLayoutProps) => {
  const { countOfColumns, countOfRows, parts } = props;

  const layout: CellLayout[] = useMemo(() => {
    const portions: CellLayout[] = [];
    const rowHeight = `${Math.floor(100 / countOfRows)}%`;
    const columnWidth = `${Math.floor(100 / countOfColumns)}%`;

    let cells: ReactNode[] = [];
    let row = { cells };
    let rows: typeof row[] = [];
    let portion = { rows, rowHeight, columnWidth };

    parts.forEach((node) => {
      if (cells.length < countOfColumns) {
        cells.push(node);
      } else {
        if (rows.length < countOfRows) {
          rows.push(row);
          cells = [node];
          row = { cells };
        } else {
          portions.push(portion);
          cells = [node];
          row = { cells };
          rows = [row];
          portion = { rows, rowHeight, columnWidth };
        }
      }
    });
    if (cells.length) {
      // restliche Zellen einfügen
      if (rows.length < countOfRows) {
        rows.push(row);
      } else {
        portions.push(portion);
        row = { cells };
        rows = [row];
        portion = { rows, rowHeight, columnWidth };
      }
    }
    if (rows.length) {
      // restliche Zeilen einfügen
      portions.push(portion);
    }
    return portions;
  }, [countOfColumns, countOfRows, parts]);

  return layout;
};

export interface DateToNumberData {
  x: number;
  y: number;
  ext: {
    fill?: string;
    stroke?: string;
    label?: string;
    sourceValue: boolean | number | string;
  };
}

export interface DateToNumberIntervalData {
  x: number;
  y: number;
  ext: {
    to: number;
    fill: string;
    label?: string;
    sourceValue: boolean | number | string;
  };
}

export type VictoryChartChildData = {
  points: DateToNumberData[];
  yMap?: Record<number, string>;
};

export interface GanttData {
  points: DateToNumberIntervalData[];
  label?:
    | string
    | ((args: { datum: { ext: DateToNumberIntervalData["ext"] } }) => string);
}

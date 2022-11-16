import { AnyDataValue } from "jm-castle-warehouse-types/build";
import {
  FormatterFactory,
  NumberFormatOptions,
  ValueFormatter,
} from "../../utils/Types";

interface TextLimits {
  minSpaceBetweenTicks: number;
}
export const textLimitsOrthogonalTextFlow: TextLimits = {
  minSpaceBetweenTicks: 30,
};
export const textLimitsInlineTextFlow: TextLimits = {
  minSpaceBetweenTicks: 45,
};
interface IScaleNumberProps {
  min: number;
  max: number;
  pixelSpan: number;
  factory: FormatterFactory;
  textLimits: TextLimits;
}
/** moment unterstützt keine Millisekunden beim format(".SSS") */
type Level = number;
interface SpanLevel {
  lev: Level;
  f: number;
  prev?: SpanLevel;
  next?: SpanLevel;
}
let levels: SpanLevel[] = [];
const initSpanLevels = () => {
  let prev: SpanLevel | undefined = undefined;
  const levArr = [];
  for (let i = -6; i < 10; i++) {
    levArr.push(i);
  }
  levArr.forEach((lev: Level) => {
    const factor = 10 ** lev;
    const level = {
      prev,
      lev,
      f: factor,
    };
    if (prev) {
      prev.next = level;
    }
    levels.push(level);
    prev = level;
  });
  levels = levels.reverse();
};
initSpanLevels();
const getSpanLevel = (span: number): SpanLevel | undefined =>
  levels.find((l) => 2 * l.f <= span);
const factorsToTry = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const getGoodTickSpan = (
  level: SpanLevel,
  start: number,
  max: number,
  maxCount: number
) => {
  const span = max - start;
  /** Mögliche Faktoren: Ohne feineres Level nur >= 1
   * Keine Faktoren, die größer sind als das nächste (gröbere) Level oder
   * kein Teiler vom nächst gröberen Level sind
   */
  const possibleFactors = level.next
    ? factorsToTry.filter(
        (f) =>
          level.prev ||
          (f >= 1 && level.next && level.next.f > f && level.next.f % f === 0)
      )
    : [10, 100, 1000];
  let i = 0;
  let factor = possibleFactors[i];
  let good = level.f * factor;
  while (span / good > maxCount && i < possibleFactors.length - 1) {
    i++;
    factor = possibleFactors[i];
    good = level.f * factor;
  }
  return [
    span / good > maxCount ? span : good,
    span / good > maxCount ? 1 : factor,
  ];
};
const getIntegerOffsetFormatter = (
  formatter: ValueFormatter,
  level: SpanLevel
) => {
  return (n: AnyDataValue) => {
    if (typeof n !== "number") {
      return "";
    }
    const decimalsValue = n % 1;
    /** Wenn es keinen (wesentlichen) decimals Anteil gibt, dann ohne vorangestelltes + */
    return `${n >= 0 && decimalsValue * 1000 > level.f ? "+" : ""}${formatter(
      Math.trunc(n)
    )}`;
  };
};
const getDecimalsDiffFormatter = (
  formatter: ValueFormatter,
  min: number,
  level: SpanLevel,
  offsetFormatter: ValueFormatter
) => {
  return (n: AnyDataValue) => {
    if (typeof n !== "number") {
      return "";
    }
    const intVal = Math.trunc(n - Math.trunc(min));
    const decimalsValue = n % 1;
    /** decimalsValue ist gerne z.B. 0.000000004 also nur fast === 0 */
    return intVal && decimalsValue * 1000 < level.f
      ? offsetFormatter(n)
      : formatter(decimalsValue).slice(1);
  };
};
export class IScaleNumber {
  private factory: FormatterFactory;
  private textLimits: TextLimits;
  private fullFormatter: ValueFormatter | undefined;
  private offsetValueFormatter: ValueFormatter | undefined;
  private decimalsValueFormatter: ValueFormatter | undefined;
  private min: number;
  private max: number;
  private span: number;
  private pixelSpan: number;
  private level: SpanLevel | undefined;
  private ticks: number[] | undefined;
  private pixelPerTick: number | undefined;
  constructor(props: IScaleNumberProps) {
    this.factory = props.factory;
    this.textLimits = props.textLimits;
    this.min = props.min;
    this.max = props.max;
    this.span = this.max - this.min;
    this.pixelSpan = props.pixelSpan;
    this.ticks = undefined;
    this.level = undefined;
    this.pixelPerTick = undefined;
    this.fullFormatter = undefined;
    this.offsetValueFormatter = undefined;
    this.getTicks = this.getTicks.bind(this);
    this.formatTick = this.formatTick.bind(this);
  }
  public getTicks(strictMin = true, strictMax = true): number[] {
    if (this.ticks) {
      return this.ticks;
    }
    this.level = getSpanLevel(this.span);
    if (!this.level) {
      this.ticks = [this.min];
      this.pixelPerTick = this.pixelSpan;
      return this.ticks;
    }
    const formatOptions: NumberFormatOptions = {
      decimals: this.level.lev < 0 ? -this.level.lev : 0,
    };
    this.fullFormatter = this.factory.getNumberFormatter(formatOptions);
    let start = Math.floor(this.min / this.level.f) * this.level.f;
    const maxCount = Math.floor(
      this.pixelSpan / this.textLimits.minSpaceBetweenTicks
    );
    const [tickSpan, tickFactor] = getGoodTickSpan(
      this.level,
      start,
      this.max,
      maxCount
    );
    if (strictMin && start < this.min) {
      start = start + tickSpan;
    }
    this.ticks = [start];
    if (tickSpan > 0) {
      let tick = start + tickSpan;
      let prevWasOverflow = false;
      let wasLastOne = false;
      while (tick <= this.max || !wasLastOne) {
        if (prevWasOverflow) {
          /** füge den ersten oberhalb von max noch ein */
          wasLastOne = true;
          !strictMax && this.ticks.push(tick);
        } else {
          this.ticks.push(tick);
          tick = tick + tickSpan;
          prevWasOverflow = tick > this.max;
        }
      }
      this.offsetValueFormatter =
        this.level.lev < 0
          ? getIntegerOffsetFormatter(
              this.factory.getNumberFormatter({ decimals: 0 }),
              this.level
            )
          : this.fullFormatter;
      /** entsprechende Anzahl Nachkommastellen für das Level plus eine weitere,
       * wenn der tickFactor < 1 (= Zwischenmarkierung bzgl. des levels) */
      this.decimalsValueFormatter =
        this.level.lev < 0 || (this.level.lev === 0 && tickFactor < 1)
          ? getDecimalsDiffFormatter(
              this.factory.getNumberFormatter({
                decimals: -this.level.lev + (tickFactor < 1 ? 1 : 0),
              }),
              this.ticks[0],
              this.level,
              this.offsetValueFormatter
            )
          : this.fullFormatter;
    }
    this.pixelPerTick = this.pixelSpan / this.ticks.length;
    return this.ticks;
  }
  /** Die erste Markierung ist evtl. nur der ganzzahlige Anteil,
   * die zweite wird weggelassen, wenn wenig Pixel pro Markierung zur Verfügung stehen */
  public formatTick(t: number, i: number, all: number[]): string {
    const f =
      this.pixelPerTick &&
      this.fullFormatter &&
      this.offsetValueFormatter &&
      this.decimalsValueFormatter &&
      this.level
        ? i === 0
          ? all.length > 1
            ? this.offsetValueFormatter(t)
            : this.fullFormatter(t)
          : all.length > 1
          ? this.decimalsValueFormatter(t)
          : this.fullFormatter(t)
        : t.toLocaleString();
    return f;
  }
}

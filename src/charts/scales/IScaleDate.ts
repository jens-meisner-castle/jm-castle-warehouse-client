import { LuxonKey } from "jm-castle-types/build";
import { DateTime, Duration } from "luxon";
import {
  getDateFormat,
  getDateFormatWithoutYear,
  getDateLevelFormat
} from "../../utils/Format";

interface IScaleDateProps {
  min: Date;
  max: Date;
  pixelSpan: number;
}
type Level = LuxonKey;
interface SpanLevel {
  lev: Level;
  f: number;
  format: string;
  fullFormat: string;
  prev?: SpanLevel;
  next?: SpanLevel;
}
let levels: SpanLevel[] = [];
const levelArr: LuxonKey[] = ["millisecond", "second", "minute", "hour", "day"];

const initSpanLevels = () => {
  let prev: SpanLevel | undefined = undefined;
  let factor = 1;
  levelArr.forEach((lev) => {
    factor = prev
      ? factor * Duration.fromObject({ [lev]: 1 }).as(prev.lev)
      : factor;
    const level = {
      prev,
      lev,
      f: factor,
      format: getDateLevelFormat(lev),
      fullFormat: getDateFormatWithoutYear(lev),
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
const factorsToTry = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const getGoodTickSpan = (
  level: SpanLevel,
  start: Date,
  max: Date,
  maxCount: number
) => {
  const span = max.getTime() - start.getTime();
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
    : [7, 30, 100, 365, 500, 1000, 2000, 3000, 5000];
  let i = 0;
  let good = level.f * possibleFactors[0];
  while (span / good > maxCount && i < possibleFactors.length - 1) {
    i++;
    good = level.f * possibleFactors[i];
  }
  return span / good > maxCount ? span : good;
};
export class IScaleDate {
  private min: Date;
  private max: Date;
  private span: number;
  private pixelSpan: number;
  private level: SpanLevel | undefined;
  private ticks: Date[] | undefined;
  private pixelPerTick: number | undefined;
  constructor(props: IScaleDateProps) {
    this.min = props.min;
    this.max = props.max;
    this.span = this.max.getTime() - this.min.getTime();
    this.pixelSpan = props.pixelSpan;
    this.ticks = undefined;
    this.level = undefined;
    this.pixelPerTick = undefined;
  }
  public getTicks(): Date[] {
    if (this.ticks) {
      return this.ticks;
    }
    this.level = getSpanLevel(this.span);
    if (!this.level) {
      this.ticks = [this.min];
      this.pixelPerTick = this.pixelSpan;
      return this.ticks;
    }
    const start = DateTime.fromJSDate(this.min)
      .plus({ [this.level.lev]: 0.5 })
      .startOf(this.level.lev)
      .toJSDate();
    const maxCount = Math.floor(this.pixelSpan / 50);
    const tickSpan = getGoodTickSpan(this.level, start, this.max, maxCount);
    this.ticks = [start];
    if (tickSpan >= 1) {
      let tickMs = start.getTime() + tickSpan;
      const maxMs = this.max.getTime();
      while (tickMs <= maxMs) {
        this.ticks.push(new Date(tickMs));
        tickMs = tickMs + tickSpan;
      }
    }
    this.pixelPerTick = this.pixelSpan / this.ticks.length;
    return this.ticks;
  }
  /** Die erste Markierung ist lang (fullFormat),
   * die zweite wird weggelassen, wenn wenig Pixel pro Markierung zur Verfügung stehen */
  public formatTick(t: Date, i: number): string {
    const f = this.level
      ? i === 0
        ? DateTime.fromJSDate(t).toFormat(this.level.fullFormat)
        : i === 1 && this.pixelPerTick && this.pixelPerTick < 80
        ? ""
        : !this.level.prev ||
          DateTime.fromJSDate(t)
            .startOf(this.level.lev)
            .toJSDate()
            .getTime() === t.getTime()
        ? DateTime.fromJSDate(t).toFormat(this.level.format)
        : DateTime.fromJSDate(t).toFormat(
            this.level.format + this.level.prev?.format
          )
      : DateTime.fromJSDate(t).toFormat(getDateFormat("second"));
    return f;
  }
}

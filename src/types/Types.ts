export type OrderElement<T> = {
  field: keyof T & string;
  direction: OrderDirection | undefined;
};

export type OrderDirection = "ascending" | "descending";

export const nextDirection = (
  direction: OrderDirection | undefined
): OrderDirection | undefined => {
  switch (direction) {
    case "ascending":
      return "descending";
    case "descending":
      return undefined;
    default:
      "ascending";
  }
  return "ascending";
};

export const newOrderForChangedElement = <T>(
  order: OrderElement<T>[],
  field: keyof T & string
): OrderElement<T>[] => {
  const foundIndex = order?.findIndex((e) => e.field === field);
  const orderElementIndex = typeof foundIndex === "number" ? foundIndex : -1;
  const orderElement =
    order && orderElementIndex > -1 ? order[orderElementIndex] : undefined;
  const orderWithoutElement = order
    ? orderElementIndex > -1
      ? [
          ...order.slice(0, orderElementIndex),
          ...order.slice(orderElementIndex + 1, order.length),
        ]
      : [...order]
    : [];
  const newDirection = nextDirection(orderElement?.direction);
  return [{ field, direction: newDirection }, ...orderWithoutElement];
};

export type FilterKeys<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export type AllowedKeys<Base, Condition> = FilterKeys<
  Base,
  Condition
>[keyof Base];

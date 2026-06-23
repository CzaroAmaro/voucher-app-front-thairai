export type SortDirection = "asc" | "desc";
export type ColumnType = "text" | "number" | "date";

export const PAGE_SIZES = [50, 100, 200] as const;

/**
 * Porównuje dwie wartości wg typu kolumny. Puste wartości (null/undefined/"")
 * zawsze lądują na końcu, niezależnie od kierunku sortowania.
 */
export const compareByType = (
    av: unknown,
    bv: unknown,
    type: ColumnType,
    direction: SortDirection
): number => {
    const aEmpty = av === null || av === undefined || av === "";
    const bEmpty = bv === null || bv === undefined || bv === "";
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    let result: number;
    if (type === "number") {
        result = Number(av) - Number(bv);
    } else if (type === "date") {
        result = new Date(av as string).getTime() - new Date(bv as string).getTime();
    } else {
        result = String(av).localeCompare(String(bv), "pl");
    }
    return direction === "asc" ? result : -result;
};

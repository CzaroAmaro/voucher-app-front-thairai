import { Voucher } from "../models/Voucher";

const currencyFormatter = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
const dateFormatter = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });

export const formatCurrency = (value: number): string =>
    currencyFormatter.format(Number.isFinite(value) ? value : 0);

export const formatDate = (value: string | Date | null): string => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
};

/** Voucher uznajemy za zrealizowany, gdy ma status "Tak" lub nie ma dostępnej kwoty. */
export const isVoucherRealized = (voucher: Voucher): boolean =>
    voucher.realized === "Tak" || voucher.availableAmount <= 0;

/** Czy data ważności minęła. */
export const isExpired = (validUntil: string | Date): boolean => {
    const date = new Date(validUntil);
    return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
};

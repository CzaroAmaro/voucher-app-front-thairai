export interface Voucher {
    id: number;
    voucherCode: string;
    saleDate: Date;
    paymentMethod: string;
    amount: number;
    realized: string;
    realizedDate: Date | null;
    note: string;
    availableAmount: number;
    validUntil: Date;
    place: string;
}
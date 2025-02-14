export interface DeletedVoucher {
    id: number;
    voucherCode: string;
    saleDate: string;
    paymentMethod: string;
    amount: number;
    note: string;
    deletedDate: string;
    reasonForDeletion: string;
}
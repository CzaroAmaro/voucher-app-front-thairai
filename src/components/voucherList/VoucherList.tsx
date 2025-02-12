import React, { useEffect, useState } from "react";
import "./VoucherList.css"
import {getVouchers} from "../../services/voucherService.ts";
import {Voucher} from "../../models/Voucher.ts";

interface Voucher {
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
}

const VouchersList: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVouchers = async () => {
            try {
                const response = await getVouchers();
                setVouchers(response.data);
            } catch (err) {
                setError("Nie udało się pobrać voucherów");
                console.error("Błąd:", err);
            } finally {
                setLoading(false);
            }
        };

        loadVouchers();
    }, []);

    if (loading) return <p>Ładowanie danych...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="vouchers-container">
            <h2 className="heading">Lista Voucherów</h2>
            <table className="table-container">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Kod vouchera</th>
                    <th>Data sprzedaży</th>
                    <th>Metoda płatności</th>
                    <th>Kwota</th>
                    <th>Zrealizowany</th>
                    <th>Data realizacji</th>
                    <th>Notatka</th>
                    <th>Pozostała kwota</th>
                    <th>Ważny do</th>
                </tr>
                </thead>
                <tbody>
                {vouchers.map((voucher) => (
                    <tr key={voucher.voucherCode}>
                        <td>{voucher.id !== null ? voucher.id : "Brak"}</td>
                        <td>{voucher.voucherCode}</td>
                        <td>{new Date(voucher.saleDate).toLocaleDateString()}</td>
                        <td>{voucher.paymentMethod}</td>
                        <td>{voucher.amount} zł</td>
                        <td>{voucher.realized}</td>
                        <td>{voucher.realizedDate}</td>
                        <td>{voucher.note}</td>
                        <td>{voucher.availableAmount} zł</td>
                        <td>{new Date(voucher.validUntil).toLocaleDateString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default VouchersList;
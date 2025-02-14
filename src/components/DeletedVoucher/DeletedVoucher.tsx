import React, { useEffect, useState } from "react";
import { getDeletedVoucher } from "../../services/voucherService";
import "./DeletedVoucher.css";

interface DeletedVoucher {
    id: number;
    voucherCode: string;
    saleDate: string;
    paymentMethod: string;
    amount: number;
    note: string;
    deletedDate: string;
    reasonForDeletion: string;
}

const DeletedVoucher: React.FC = () => {
    const [vouchers, setVouchers] = useState<DeletedVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDeletedVouchers = async () => {
            try {
                const response = await getDeletedVoucher();
                setVouchers(response.data);
                setError(null);
            } catch (err) {
                setError("Nie udało się pobrać usuniętych voucherów");
                console.error("Błąd:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDeletedVouchers();
    }, []);

    if (loading) return <p>Ładowanie usuniętych voucherów...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="deleted-voucher-container">
            <h2 className="heading">Usunięte Vouchery</h2>
            <div className="table-wrapper">
                <table className="table-container">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Kod vouchera</th>
                        <th>Data sprzedaży</th>
                        <th>Metoda płatności</th>
                        <th>Kwota</th>
                        <th>Notatka</th>
                        <th>Data usunięcia</th>
                        <th>Powód usunięcia</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vouchers.map((voucher) => (
                        <tr key={voucher.voucherCode}>
                            <td>{voucher.id}</td>
                            <td>{voucher.voucherCode}</td>
                            <td>{new Date(voucher.saleDate).toLocaleDateString()}</td>
                            <td>{voucher.paymentMethod}</td>
                            <td>{voucher.amount} zł</td>
                            <td>{voucher.note}</td>
                            <td>{new Date(voucher.deletedDate).toLocaleDateString()}</td>
                            <td>{voucher.reasonForDeletion}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeletedVoucher;

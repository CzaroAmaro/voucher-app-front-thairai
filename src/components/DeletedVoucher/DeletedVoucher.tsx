import React, { useEffect, useState } from "react";
import { getDeletedVoucher } from "../../services/voucherService";
import "./DeletedVoucher.css";
import {Voucher} from "../../models/Voucher.ts";
import VoucherModal from "../VoucherModal/VoucherModal.tsx";
import DeleteVoucherModal from "../DeleteVoucherModal/DeleteVoucherModal.tsx";

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
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

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

    const handleRowClick = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
    };

    const closeModal = () => {
        setSelectedVoucher(null);
    };

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
                        <tr key={voucher.voucherCode}
                            onClick={() => handleRowClick(voucher)}
                            style={{cursor: "pointer"}}
                        >
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
            {selectedVoucher && (
                <DeleteVoucherModal
                    voucher={selectedVoucher}
                    onClose={closeModal}
                    onDelete={(id: number) =>
                        setVouchers((prev) => prev.filter((v) => v.id !== id))}
                />
            )}
        </div>
    );
};

export default DeletedVoucher;

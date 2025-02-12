import React, { useEffect, useState } from "react";
import "./VoucherList.css"
import {getVouchers} from "../../services/voucherService.ts";
import {Voucher} from "../../models/Voucher.ts";
import VoucherSort from "../VoucherSort/VoucherSort.tsx";

const VouchersList: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

    const handleSort = (column: string) => {
        const isAsc = sortColumn === column && sortDirection === "asc";
        const newDirection = isAsc ? "desc" : "asc";
        setSortDirection(newDirection);
        setSortColumn(column);

        const sortedVouchers = [...vouchers].sort((a, b) => {
            const aValue = a[column as keyof Voucher];
            const bValue = b[column as keyof Voucher];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (aValue < bValue) return newDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return newDirection === "asc" ? 1 : -1;
            return 0;
        });

        setVouchers(sortedVouchers);
    };

    if (loading) return <p>Ładowanie danych...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="vouchers-container">
            <h2 className="heading">Lista Voucherów</h2>
            <table className="table-container">
                <thead>
                <tr>
                    <VoucherSort
                        column="id"
                        label="ID"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="voucherCode"
                        label="Kod vouchera"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="saleDate"
                        label="Data sprzedaży"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="paymentMethod"
                        label="Metoda płatności"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="amount"
                        label="Kwota"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="realized"
                        label="Zrealizowany"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="realizedDate"
                        label="Data realizacji"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="note"
                        label="Notatka"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="availableAmount"
                        label="Pozostała kwota"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <VoucherSort
                        column="validUntil"
                        label="Ważny do"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
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
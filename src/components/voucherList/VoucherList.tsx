import React, { useEffect, useState } from "react";
import "./VoucherList.css";
import { getVouchers, getVoucherById, getVoucherByPartOfCode } from "../../services/voucherService";
import { Voucher } from "../../models/Voucher";
import VoucherSort from "../VoucherSort/VoucherSort";
import VoucherModal from "../VoucherModal/VoucherModal";

const VouchersList: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const response = await getVouchers();
            const sorted = response.data.sort((a: Voucher, b: Voucher) => b.id - a.id);
            setVouchers(sorted);
            setError(null);
        } catch (err) {
            setError("Nie udało się pobrać voucherów");
            console.error("Błąd:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) {
            loadVouchers();
            return;
        }
        setLoading(true);
        try {
            if (/^\d+$/.test(searchTerm)) {
                const response = await getVoucherById(Number(searchTerm));
                setVouchers([response.data]);
            } else {
                const response = await getVoucherByPartOfCode(searchTerm);
                setVouchers(response.data);
            }
            setError(null);
        } catch (err) {
            setError("Voucher o podanym kryterium nie został znaleziony");
            console.error("Błąd wyszukiwania:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        loadVouchers();
    };

    const handleRowClick = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
    };

    const closeModal = () => {
        setSelectedVoucher(null);
    };

    const updateVoucher = (updatedVoucher: Voucher) => {
        setVouchers((prev) =>
            prev.map((v) =>
                v.voucherCode === updatedVoucher.voucherCode ? updatedVoucher : v
            )
        );
    };

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
            <form onSubmit={handleSearch} className="search-form">
                <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Wpisz ID lub fragment kodu"
                />
                <button type="submit">Szukaj</button>
                <button type="button" onClick={handleReset}>
                    Resetuj
                </button>
            </form>
            <div className="table-wrapper">
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
                        <tr
                            key={voucher.voucherCode}
                            onClick={() => handleRowClick(voucher)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{voucher.id !== null ? voucher.id : "Brak"}</td>
                            <td>{voucher.voucherCode}</td>
                            <td>{new Date(voucher.saleDate).toLocaleDateString()}</td>
                            <td>{voucher.paymentMethod}</td>
                            <td>{voucher.amount} zł</td>
                            <td>{voucher.realized}</td>
                            <td>{voucher.realizedDate ? new Date(voucher.realizedDate).toLocaleDateString() : "Brak"}</td>
                            <td>{voucher.note}</td>
                            <td>{voucher.availableAmount} zł</td>
                            <td>{new Date(voucher.validUntil).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {selectedVoucher && (
                <VoucherModal
                    voucher={selectedVoucher}
                    onClose={closeModal}
                    onUpdate={updateVoucher}
                    onDelete={(id: number) =>
                        setVouchers((prev) => prev.filter((v) => v.id !== id))
                    }
                />
            )}
        </div>
    );
};

export default VouchersList;

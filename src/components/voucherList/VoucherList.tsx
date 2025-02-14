import React, { useEffect, useState } from "react";
import "./VoucherList.css"
import {getVouchers, getVoucherById, getVoucherByCode} from "../../services/voucherService.ts";
import {Voucher} from "../../models/Voucher.ts";
import VoucherSort from "../VoucherSort/VoucherSort.tsx";
import VoucherModal from "../VoucherModal/VoucherModal.tsx";

const VouchersList: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [searchId, setSearchId] = useState<string>("");
    const [searchCode, setSearchCode] = useState<string>("");

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const response = await getVouchers();
            setVouchers(response.data);
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
        if (!searchId) {
            loadVouchers();
            return;
        }
        try {
            setLoading(true);
            const response = await getVoucherById(Number(searchId));
            setVouchers([response.data]);
            setError(null);
        } catch (err) {
            setError("Voucher o podanym ID nie został znaleziony");
            console.error("Błąd wyszukiwania:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode){
            loadVouchers();
            return;
        }
        try {
            setLoading(true);
            const response = await getVoucherByCode(searchCode);
            setVouchers([response.data]);
            setError(null);
        } catch (err) {
            setError("Voucher o podanym kodzie nie został znaleziony");
            console.error("Błąd wyszukiwania", err);
        } finally {
            setLoading(false);
        }
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
                <label htmlFor="search">Wyszukaj voucher po ID::</label>
                <input
                    id="search"
                    type="number"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Wpisz ID"
                />
                <button type="submit">Szukaj</button>
            </form>
            <form onSubmit={handleSearchByCode} className="search-form">
                <label htmlFor="search">Wyszukaj voucher po kodzie::</label>
                <input
                    id="search"
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Wpisz kod"
                />
                <button type="submit">Szukaj</button>
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
                            style={{cursor: "pointer"}}
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
                        setVouchers((prev) => prev.filter((v) => v.id !== id))}
                />
            )}
        </div>
    );
};

export default VouchersList;
import React, { useEffect, useState, useMemo } from "react";
import "./VoucherList.css";
import { getVouchers, getVoucherById, getVoucherByPartOfCode } from "../../services/voucherService";
import { Voucher } from "../../models/Voucher";
import VoucherSort from "../VoucherSort/VoucherSort";
import VoucherModal from "../VoucherModal/VoucherModal";

const VouchersList: React.FC = () => {
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);

    useEffect(() => {
        loadVouchers()
    }, []);

    const loadVouchers = async () => {
        setLoading(true)
        try {
            const response = await getVouchers()
            setAllVouchers(response.data); // Ustawiamy główną listę
            setError(null)
        } catch (err) {
            setError("Nie udało się pobrać voucherów")
            console.error("Błąd:", err)
        } finally {
            setLoading(false)
        }
    };

    const sortedVouchers = useMemo(() => {
        return [...allVouchers].sort((a, b) => {
            const aValue = a[sortColumn as keyof Voucher];
            const bValue = b[sortColumn as keyof Voucher];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [allVouchers, sortColumn, sortDirection]);

    const currentVouchers = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedVouchers.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedVouchers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) {
            loadVouchers();
            return;
        }
        setLoading(true);
        try {
            let response;
            if (/^\d+$/.test(searchTerm)) {
                response = await getVoucherById(Number(searchTerm));
                setAllVouchers([response.data]);
            } else {
                response = await getVoucherByPartOfCode(searchTerm);
                setAllVouchers(response.data);
            }
            setCurrentPage(1);
            setError(null);
        } catch (err) {
            setError("Voucher o podanym kryterium nie został znaleziony");
            setAllVouchers([])
            console.error("Błąd wyszukiwania:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setCurrentPage(1); // Resetuj stronę
        loadVouchers();
    };

    const handleRowClick = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
    };

    const closeModal = () => {
        setSelectedVoucher(null);
    };

    const updateVoucher = (updatedVoucher: Voucher) => {
        setAllVouchers((prev) =>
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
        setCurrentPage(1);
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
                        <VoucherSort column="id" label="ID" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="voucherCode" label="Kod vouchera" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="saleDate" label="Data sprzedaży" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="paymentMethod" label="Metoda płatności" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="amount" label="Kwota" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="realized" label="Zrealizowany" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="realizedDate" label="Data realizacji" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="note" label="Notatka" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="availableAmount" label="Pozostała kwota" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="validUntil" label="Ważny do" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                        <VoucherSort column="place" label="Miejsce" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                    </tr>
                    </thead>
                    <tbody>
                    {currentVouchers.map((voucher) => (
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
                            <td>{voucher.place}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="modal-buttons">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    Poprzednia
                </button>
                <span>
                    Strona {currentPage} z {totalPages}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    Następna
                </button>
            </div>


            {selectedVoucher && (
                <VoucherModal
                    voucher={selectedVoucher}
                    onClose={closeModal}
                    onUpdate={updateVoucher}
                    onDelete={(id: number) =>
                        setAllVouchers((prev) => prev.filter((v) => v.id !== id))
                    }
                />
            )}
        </div>
    );
};

export default VouchersList;
import React, { useEffect, useMemo, useState } from "react";
import { getDeletedVoucher } from "../../services/voucherService";
import DeleteVoucherModal from "../DeleteVoucherModal/DeleteVoucherModal.tsx";
import VoucherSort from "../VoucherSort/VoucherSort";
import TablePager from "../TablePager/TablePager";
import { Voucher } from "../../models/Voucher.ts";
import { formatCurrency, formatDate } from "../../utils/voucher.ts";
import { ColumnType, PAGE_SIZES, SortDirection, compareByType } from "../../utils/table.ts";
// Reużywamy stylu tabeli z listy voucherów (klasy vl-*), aby wygląd był identyczny.
import "../voucherList/VoucherList.css";

// Rozszerz interfejs Voucher o dodatkowe właściwości usuniętego vouchera
interface DeletedVoucher extends Voucher {
    deletedDate: string;
    reasonForDeletion: string;
}

const COLUMNS: { key: keyof DeletedVoucher; label: string; type: ColumnType }[] = [
    { key: "id", label: "ID", type: "number" },
    { key: "voucherCode", label: "Kod vouchera", type: "text" },
    { key: "saleDate", label: "Data sprzedaży", type: "date" },
    { key: "paymentMethod", label: "Metoda płatności", type: "text" },
    { key: "amount", label: "Kwota", type: "number" },
    { key: "note", label: "Notatka", type: "text" },
    { key: "deletedDate", label: "Data usunięcia", type: "date" },
    { key: "reasonForDeletion", label: "Powód usunięcia", type: "text" },
];

const DeletedVoucher: React.FC = () => {
    const [vouchers, setVouchers] = useState<DeletedVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVoucher, setSelectedVoucher] = useState<DeletedVoucher | null>(null);

    const [sortColumn, setSortColumn] = useState<keyof DeletedVoucher>("id");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(100);

    useEffect(() => {
        const loadDeletedVouchers = async () => {
            try {
                const response = await getDeletedVoucher();
                setVouchers(response.data);
                setError(null);
            } catch (err) {
                setError("Nie udało się pobrać usuniętych voucherów.");
                console.error("Błąd:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDeletedVouchers();
    }, []);

    const columnType = useMemo(
        () => new Map(COLUMNS.map((c) => [c.key, c.type])),
        []
    );

    const sortedVouchers = useMemo(() => {
        const type = columnType.get(sortColumn) ?? "text";
        return [...vouchers].sort((a, b) =>
            compareByType(a[sortColumn], b[sortColumn], type, sortDirection)
        );
    }, [vouchers, sortColumn, sortDirection, columnType]);

    const totalPages = Math.max(1, Math.ceil(sortedVouchers.length / pageSize));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const currentVouchers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedVouchers.slice(start, start + pageSize);
    }, [sortedVouchers, currentPage, pageSize]);

    const handleSort = (column: string) => {
        const key = column as keyof DeletedVoucher;
        setSortDirection((prevDir) =>
            sortColumn === key ? (prevDir === "asc" ? "desc" : "asc") : "asc"
        );
        setSortColumn(key);
        setCurrentPage(1);
    };

    return (
        <div className="vl-page">
            <header className="vl-header">
                <h1>Usunięte vouchery</h1>
                <p>{loading ? "Ładowanie…" : `Znaleziono ${vouchers.length} usuniętych voucherów`}</p>
            </header>

            <div className="vl-card">
                {error && (
                    <p className="vl-message vl-message--error" role="alert">{error}</p>
                )}

                <div className="vl-table-wrap">
                    <table className="vl-table">
                        <thead>
                        <tr>
                            {COLUMNS.map(({ key, label }) => (
                                <VoucherSort
                                    key={key}
                                    column={key}
                                    label={label}
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="vl-state">Ładowanie danych…</td>
                            </tr>
                        ) : currentVouchers.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="vl-state">Brak usuniętych voucherów.</td>
                            </tr>
                        ) : (
                            currentVouchers.map((voucher) => (
                                <tr
                                    key={voucher.voucherCode}
                                    className="vl-row"
                                    onClick={() => setSelectedVoucher(voucher)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") setSelectedVoucher(voucher);
                                    }}
                                >
                                    <td>{voucher.id ?? "—"}</td>
                                    <td className="vl-code">{voucher.voucherCode}</td>
                                    <td>{formatDate(voucher.saleDate)}</td>
                                    <td>{voucher.paymentMethod}</td>
                                    <td>{formatCurrency(voucher.amount)}</td>
                                    <td className="vl-note">{voucher.note}</td>
                                    <td>{formatDate(voucher.deletedDate)}</td>
                                    <td>{voucher.reasonForDeletion}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <TablePager
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizes={PAGE_SIZES}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {selectedVoucher && (
                <DeleteVoucherModal
                    voucher={selectedVoucher}
                    onClose={() => setSelectedVoucher(null)}
                    onDelete={(id: number) =>
                        setVouchers((prev) => prev.filter((v) => v.id !== id))}
                />
            )}
        </div>
    );
};

export default DeletedVoucher;

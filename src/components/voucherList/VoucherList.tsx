import React, { useEffect, useMemo, useState } from "react";
import "./VoucherList.css";
import { getVouchers, getVoucherById, getVoucherByPartOfCode } from "../../services/voucherService";
import { Voucher } from "../../models/Voucher";
import VoucherSort from "../VoucherSort/VoucherSort";
import VoucherModal from "../VoucherModal/VoucherModal";
import TablePager from "../TablePager/TablePager";
import { formatCurrency, formatDate, isExpired, isVoucherRealized } from "../../utils/voucher";
import { ColumnType, PAGE_SIZES, SortDirection, compareByType } from "../../utils/table";

type StatusFilter = "all" | "realized" | "notRealized";

const PLACES = ["Ostrołęka", "Ostrołęka-2", "Mława"] as const;
const PAYMENT_METHODS = ["Blik", "Gotówka"] as const;

const COLUMNS: { column: keyof Voucher; label: string; type: ColumnType }[] = [
    { column: "id", label: "ID", type: "number" },
    { column: "voucherCode", label: "Kod vouchera", type: "text" },
    { column: "saleDate", label: "Data sprzedaży", type: "date" },
    { column: "paymentMethod", label: "Metoda płatności", type: "text" },
    { column: "amount", label: "Kwota", type: "number" },
    { column: "realized", label: "Status", type: "text" },
    { column: "realizedDate", label: "Data realizacji", type: "date" },
    { column: "availableAmount", label: "Pozostała kwota", type: "number" },
    { column: "validUntil", label: "Ważny do", type: "date" },
    { column: "place", label: "Miejsce", type: "text" },
    { column: "note", label: "Notatka", type: "text" },
];

const COLUMN_TYPE = new Map(COLUMNS.map((c) => [c.column, c.type]));

const VouchersList: React.FC = () => {
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortColumn, setSortColumn] = useState<keyof Voucher>("id");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [placeFilter, setPlaceFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(100);

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const response = await getVouchers();
            setAllVouchers(response.data);
            setError(null);
        } catch (err) {
            setError("Nie udało się pobrać voucherów.");
            console.error("Błąd:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredVouchers = useMemo(() => {
        const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
        const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

        return allVouchers.filter((voucher) => {
            if (statusFilter === "realized" && !isVoucherRealized(voucher)) return false;
            if (statusFilter === "notRealized" && isVoucherRealized(voucher)) return false;
            if (placeFilter && voucher.place !== placeFilter) return false;
            if (paymentFilter && voucher.paymentMethod !== paymentFilter) return false;

            if (from !== null || to !== null) {
                const saleTime = new Date(voucher.saleDate).getTime();
                if (Number.isNaN(saleTime)) return false;
                if (from !== null && saleTime < from) return false;
                if (to !== null && saleTime > to) return false;
            }
            return true;
        });
    }, [allVouchers, statusFilter, placeFilter, paymentFilter, dateFrom, dateTo]);

    const sortedVouchers = useMemo(() => {
        const type = COLUMN_TYPE.get(sortColumn) ?? "text";
        return [...filteredVouchers].sort((a, b) =>
            compareByType(a[sortColumn], b[sortColumn], type, sortDirection)
        );
    }, [filteredVouchers, sortColumn, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedVouchers.length / pageSize));

    // Resetuj stronę przy zmianie filtrów / rozmiaru strony.
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, placeFilter, paymentFilter, dateFrom, dateTo, pageSize]);

    // Pilnuj, by bieżąca strona nie wykraczała poza zakres.
    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const currentVouchers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedVouchers.slice(start, start + pageSize);
    }, [sortedVouchers, currentPage, pageSize]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) {
            loadVouchers();
            return;
        }
        setLoading(true);
        try {
            const byId = /^\d+$/.test(term);
            const response = byId
                ? await getVoucherById(Number(term))
                : await getVoucherByPartOfCode(term);
            const data = response.data;
            setAllVouchers(Array.isArray(data) ? data : data ? [data] : []);
            setCurrentPage(1);
            setError(null);
        } catch (err) {
            console.error("Błąd wyszukiwania:", err);
            setAllVouchers([]);
            setError("Nie znaleziono vouchera dla podanego kryterium.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPlaceFilter("");
        setPaymentFilter("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
        loadVouchers();
    };

    const handleSort = (column: string) => {
        const key = column as keyof Voucher;
        setSortDirection((prevDir) =>
            sortColumn === key ? (prevDir === "asc" ? "desc" : "asc") : "asc"
        );
        setSortColumn(key);
        setCurrentPage(1);
    };

    const updateVoucher = (updatedVoucher: Voucher) => {
        setAllVouchers((prev) =>
            prev.map((v) => (v.voucherCode === updatedVoucher.voucherCode ? updatedVoucher : v))
        );
    };

    const deleteVoucher = (id: number) => {
        setAllVouchers((prev) => prev.filter((v) => v.id !== id));
    };

    return (
        <div className="vl-page">
            <header className="vl-header">
                <h1>Lista voucherów</h1>
                <p>{loading ? "Ładowanie…" : `Znaleziono ${sortedVouchers.length} voucherów`}</p>
            </header>

            <div className="vl-card">
                <form className="vl-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Szukaj po ID lub fragmencie kodu"
                        aria-label="Szukaj po ID lub fragmencie kodu"
                    />
                    <button type="submit" className="vl-btn vl-btn--primary" disabled={loading}>
                        Szukaj
                    </button>
                    <button type="button" className="vl-btn" onClick={handleReset} disabled={loading}>
                        Resetuj
                    </button>
                </form>

                <div className="vl-filters">
                    <div className="vl-field">
                        <label htmlFor="vl-status">Status</label>
                        <select
                            id="vl-status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        >
                            <option value="all">Wszystkie</option>
                            <option value="realized">Zrealizowane</option>
                            <option value="notRealized">Niezrealizowane</option>
                        </select>
                    </div>
                    <div className="vl-field">
                        <label htmlFor="vl-place">Miejsce</label>
                        <select id="vl-place" value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)}>
                            <option value="">Wszystkie</option>
                            {PLACES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="vl-field">
                        <label htmlFor="vl-payment">Metoda płatności</label>
                        <select id="vl-payment" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                            <option value="">Wszystkie</option>
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="vl-field">
                        <label htmlFor="vl-from">Sprzedaż od</label>
                        <input id="vl-from" type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div className="vl-field">
                        <label htmlFor="vl-to">Sprzedaż do</label>
                        <input id="vl-to" type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                </div>

                {error && (
                    <p className="vl-message vl-message--error" role="alert">{error}</p>
                )}

                <div className="vl-table-wrap">
                    <table className="vl-table">
                        <thead>
                        <tr>
                            {COLUMNS.map(({ column, label }) => (
                                <VoucherSort
                                    key={column}
                                    column={column}
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
                                <td colSpan={COLUMNS.length} className="vl-state">Brak voucherów spełniających kryteria.</td>
                            </tr>
                        ) : (
                            currentVouchers.map((voucher) => {
                                const realized = isVoucherRealized(voucher);
                                const expired = !realized && isExpired(voucher.validUntil);
                                return (
                                    <tr
                                        key={voucher.voucherCode}
                                        className={`vl-row ${realized ? "is-realized" : ""}`}
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
                                        <td>
                                            <span className={`vl-badge ${realized ? "vl-badge--success" : "vl-badge--muted"}`}>
                                                {realized ? "Zrealizowany" : "Aktywny"}
                                            </span>
                                        </td>
                                        <td>{formatDate(voucher.realizedDate)}</td>
                                        <td>{formatCurrency(voucher.availableAmount)}</td>
                                        <td className={expired ? "vl-expired" : ""}>
                                            {formatDate(voucher.validUntil)}
                                            {expired && <span className="vl-badge vl-badge--warn">przedawniony</span>}
                                        </td>
                                        <td>{voucher.place || "—"}</td>
                                        <td className="vl-note">{voucher.note}</td>
                                    </tr>
                                );
                            })
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
                    onPageSizeChange={setPageSize}
                />
            </div>

            {selectedVoucher && (
                <VoucherModal
                    voucher={selectedVoucher}
                    onClose={() => setSelectedVoucher(null)}
                    onUpdate={updateVoucher}
                    onDelete={deleteVoucher}
                />
            )}
        </div>
    );
};

export default VouchersList;

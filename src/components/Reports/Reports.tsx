import React, { useEffect, useMemo, useState } from "react";
import { getReport, generateReportList } from "../../services/reportService";
import {
    getVoucherByMonthAndYear,
    getVoucherRealizedByMonthAndYear,
    deleteVoucher,
} from "../../services/voucherService";
import { Voucher } from "../../models/Voucher";
import { formatCurrency, formatDate } from "../../utils/voucher";
import "./Reports.css";

type Mode = "monthly" | "custom";

const DELETE_REASONS = [
    "wystawiony omyłkowo",
    "niepoprawna kwota",
    "duplikat",
    "anulowana transakcja",
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString("pl-PL", { month: "long" }),
}));
const YEARS = Array.from({ length: CURRENT_YEAR - 2022 }, (_, i) => CURRENT_YEAR - i);

const downloadPdf = (data: BlobPart, filename: string) => {
    const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Zwolnij pamięć po zakończeniu pobierania.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const Reports: React.FC = () => {
    const now = new Date();
    const [mode, setMode] = useState<Mode>("monthly");
    const [month, setMonth] = useState<number>(now.getMonth() + 1);
    const [year, setYear] = useState<number>(CURRENT_YEAR);

    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Tryb "z wybranych"
    const [issued, setIssued] = useState<Voucher[]>([]);
    const [realized, setRealized] = useState<Voucher[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [fetching, setFetching] = useState(false);
    const [loadedPeriod, setLoadedPeriod] = useState<{ month: number; year: number } | null>(null);

    // Usuwanie zaznaczonych (przeniesienie do "usuniętych")
    const [deleting, setDeleting] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");

    // Zmiana okresu unieważnia wcześniej pobraną listę (eliminuje rozjazd miesiąc/zaznaczenie).
    useEffect(() => {
        setIssued([]);
        setRealized([]);
        setSelectedIds(new Set());
        setLoadedPeriod(null);
    }, [month, year]);

    const monthLabel = useMemo(
        () => MONTHS.find((m) => m.value === month)?.label ?? String(month),
        [month]
    );

    const switchMode = (next: Mode) => {
        setMode(next);
        setError("");
        setMessage("");
    };

    const handleMonthlyReport = async () => {
        setError("");
        setMessage("");
        setGenerating(true);
        try {
            const { data } = await getReport(month, year);
            downloadPdf(data, `raport-${year}-${String(month).padStart(2, "0")}.pdf`);
            setMessage(`Pobrano raport miesięczny: ${monthLabel} ${year}.`);
        } catch (err) {
            console.error("Błąd przy generowaniu raportu:", err);
            setError("Nie udało się wygenerować raportu.");
        } finally {
            setGenerating(false);
        }
    };

    const handleFetchVouchers = async () => {
        setError("");
        setMessage("");
        setFetching(true);
        try {
            const [issuedRes, realizedRes] = await Promise.all([
                getVoucherByMonthAndYear(month, year),
                getVoucherRealizedByMonthAndYear(month, year),
            ]);
            setIssued(issuedRes.data);
            setRealized(realizedRes.data);
            setSelectedIds(new Set());
            setLoadedPeriod({ month, year });
        } catch (err) {
            console.error("Błąd przy pobieraniu voucherów:", err);
            setError("Nie udało się pobrać voucherów dla wybranego okresu.");
        } finally {
            setFetching(false);
        }
    };

    const handleCustomReport = async () => {
        setError("");
        setMessage("");
        if (!loadedPeriod) return;
        if (selectedIds.size === 0) {
            setError("Zaznacz przynajmniej jeden voucher.");
            return;
        }
        setGenerating(true);
        try {
            const { data } = await generateReportList(
                [...selectedIds],
                loadedPeriod.month,
                loadedPeriod.year
            );
            downloadPdf(
                data,
                `raport-wybrane-${loadedPeriod.year}-${String(loadedPeriod.month).padStart(2, "0")}.pdf`
            );
            setMessage(`Pobrano raport z ${selectedIds.size} zaznaczonych voucherów.`);
        } catch (err) {
            console.error("Błąd przy generowaniu raportu:", err);
            setError("Nie udało się wygenerować raportu.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteSelected = async () => {
        setError("");
        setMessage("");
        if (selectedIds.size === 0) {
            setError("Zaznacz przynajmniej jeden voucher.");
            return;
        }
        const reason = deleteReason.trim();
        if (!reason) {
            setError("Wybierz powód usunięcia zaznaczonych voucherów.");
            return;
        }
        if (!window.confirm(`Przenieść ${selectedIds.size} zaznaczonych voucherów do usuniętych?`)) return;

        setDeleting(true);
        try {
            const ids = [...selectedIds];
            const results = await Promise.allSettled(ids.map((id) => deleteVoucher(id, reason)));
            const removed = new Set(
                ids.filter((_, i) => results[i].status === "fulfilled")
            );
            const failed = ids.length - removed.size;

            // Usuń przeniesione vouchery z list i zaznaczenia.
            setIssued((prev) => prev.filter((v) => !removed.has(v.id)));
            setRealized((prev) => prev.filter((v) => !removed.has(v.id)));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                removed.forEach((id) => next.delete(id));
                return next;
            });

            if (removed.size > 0) {
                setMessage(`Przeniesiono ${removed.size} voucherów do usuniętych.`);
            }
            if (failed > 0) {
                setError(`Nie udało się usunąć ${failed} z ${ids.length} voucherów.`);
            }
        } catch (err) {
            console.error("Błąd przy usuwaniu voucherów:", err);
            setError("Nie udało się usunąć zaznaczonych voucherów.");
        } finally {
            setDeleting(false);
        }
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const toggleGroup = (vouchers: Voucher[], select: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            vouchers.forEach((v) => (select ? next.add(v.id) : next.delete(v.id)));
            return next;
        });
    };

    const renderVoucherGroup = (title: string, vouchers: Voucher[]) => {
        if (vouchers.length === 0) return null;
        const allSelected = vouchers.every((v) => selectedIds.has(v.id));
        return (
            <div className="rp-group">
                <div className="rp-group__head">
                    <h3>{title} ({vouchers.length})</h3>
                    <button
                        type="button"
                        className="rp-btn rp-btn--ghost"
                        onClick={() => toggleGroup(vouchers, !allSelected)}
                    >
                        {allSelected ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
                    </button>
                </div>
                <ul className="rp-list">
                    {vouchers.map((v) => (
                        <li key={v.id}>
                            <label className="rp-item">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(v.id)}
                                    onChange={(e) => toggleOne(v.id, e.target.checked)}
                                />
                                <span className="rp-item__code">{v.voucherCode}</span>
                                <span className="rp-item__meta">
                                    {formatDate(v.saleDate)} · {v.paymentMethod} · {v.place || "—"}
                                </span>
                                <span className="rp-item__amount">{formatCurrency(v.amount)}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const hasResults = issued.length > 0 || realized.length > 0;

    return (
        <div className="rp-page">
            <header className="rp-header">
                <h1>Raporty</h1>
                <p>Wygeneruj raport miesięczny lub z ręcznie wybranych voucherów.</p>
            </header>

            <div className="rp-card">
                <div className="rp-tabs" role="tablist" aria-label="Rodzaj raportu">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "monthly"}
                        className={`rp-tab ${mode === "monthly" ? "is-active" : ""}`}
                        onClick={() => switchMode("monthly")}
                    >
                        Miesięczny
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "custom"}
                        className={`rp-tab ${mode === "custom" ? "is-active" : ""}`}
                        onClick={() => switchMode("custom")}
                    >
                        Z wybranych voucherów
                    </button>
                </div>

                <div className="rp-period">
                    <div className="rp-field">
                        <label htmlFor="rp-month">Miesiąc</label>
                        <select id="rp-month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {MONTHS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="rp-field">
                        <label htmlFor="rp-year">Rok</label>
                        <select id="rp-year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            {YEARS.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {mode === "monthly" ? (
                        <button
                            type="button"
                            className="rp-btn rp-btn--primary"
                            onClick={handleMonthlyReport}
                            disabled={generating}
                        >
                            {generating ? "Generuję…" : "Generuj raport"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="rp-btn rp-btn--primary"
                            onClick={handleFetchVouchers}
                            disabled={fetching}
                        >
                            {fetching ? "Pobieram…" : "Pobierz vouchery"}
                        </button>
                    )}
                </div>

                {error && <p className="rp-message rp-message--error" role="alert">{error}</p>}
                {message && <p className="rp-message rp-message--success" role="status">{message}</p>}

                {mode === "custom" && loadedPeriod && (
                    <>
                        <div className="rp-loaded">
                            Załadowano: <strong>{monthLabel} {loadedPeriod.year}</strong>
                            {" · "}zaznaczono <strong>{selectedIds.size}</strong>
                        </div>

                        {hasResults ? (
                            <>
                                {renderVoucherGroup("Vouchery sprzedane", issued)}
                                {renderVoucherGroup("Vouchery zrealizowane", realized)}
                                <div className="rp-actions">
                                    <div className="rp-actions__danger">
                                        <select
                                            aria-label="Powód usunięcia zaznaczonych"
                                            value={deleteReason}
                                            onChange={(e) => setDeleteReason(e.target.value)}
                                            disabled={deleting || selectedIds.size === 0}
                                        >
                                            <option value="">Powód usunięcia…</option>
                                            {DELETE_REASONS.map((r) => (
                                                <option key={r} value={r}>
                                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="rp-btn rp-btn--danger"
                                            onClick={handleDeleteSelected}
                                            disabled={deleting || generating || selectedIds.size === 0}
                                        >
                                            {deleting ? "Usuwam…" : "Usuń zaznaczone"}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="rp-btn rp-btn--primary"
                                        onClick={handleCustomReport}
                                        disabled={generating || deleting || selectedIds.size === 0}
                                    >
                                        {generating ? "Generuję…" : "Generuj raport z zaznaczonych"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="rp-empty">Brak voucherów w wybranym okresie.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports;

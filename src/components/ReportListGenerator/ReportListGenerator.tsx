import React, { useState, useEffect } from "react";
import "./ReportListGenerator.css";
import {
    getVoucherByMonthAndYear,
    getVoucherRealizedByMonthAndYear,
} from "../../services/voucherService";
import { generateReportList } from "../../services/reportService";
import { Voucher } from "../../models/Voucher";

const ReportListGenerator: React.FC = () => {
    const [month, setMonth] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [issuedVouchers, setIssuedVouchers] = useState<Voucher[]>([]);
    const [realizedVouchers, setRealizedVouchers] = useState<Voucher[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reportUrl, setReportUrl] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleFetchVouchers = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setReportUrl("");
        try {
            setLoading(true);
            const [issuedResponse, realizedResponse] = await Promise.all([
                getVoucherByMonthAndYear(Number(month), Number(year)),
                getVoucherRealizedByMonthAndYear(Number(month), Number(year)),
            ]);
            setIssuedVouchers(issuedResponse.data);
            setRealizedVouchers(realizedResponse.data);
            setSelectedIds([]);
        } catch (err) {
            setError("Nie udało się pobrać voucherów dla podanego miesiąca i roku.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = (vouchers: Voucher[]) => {
        const voucherIds = vouchers.map((v) => v.id);
        const allSelected = voucherIds.every((id) => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !voucherIds.includes(id)));
        } else {
            const newIds = voucherIds.filter((id) => !selectedIds.includes(id));
            setSelectedIds((prev) => [...prev, ...newIds]);
        }
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((x) => x !== id));
        }
    };

    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (selectedIds.length === 0) {
            setError("Proszę zaznaczyć przynajmniej jeden voucher.");
            return;
        }
        try {
            const response = await generateReportList(
                selectedIds,
                Number(month),
                Number(year)
            );
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setReportUrl(url);
        } catch (err) {
            setError("Błąd podczas generowania raportu.");
            console.error(err);
        }
    };

    useEffect(() => {
        return () => {
            if (reportUrl) {
                URL.revokeObjectURL(reportUrl);
            }
        };
    }, [reportUrl]);

    return (
        <div className="report-list-generator">
            <h2>Generowanie raportu z wybranych voucherów</h2>
            <form onSubmit={handleFetchVouchers} className="fetch-form">
                <div className="form-group">
                    <label>Miesiąc:</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                    >
                        <option value="">Wybierz miesiąc</option>
                        {Array.from({length: 12}, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString("pl", {month: "long"})}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Rok:</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Rok (np. 2025)"
                        required
                    />
                </div>
                <button type="submit">Pobierz vouchery</button>
            </form>

            {loading && <p>Ładowanie voucherów...</p>}
            {error && <p className="error">{error}</p>}

            {(issuedVouchers.length > 0 || realizedVouchers.length > 0) && (
                <div className="vouchers-container">
                    {issuedVouchers.length > 0 && (
                        <div className="voucher-list">
                            <div className="voucher-list-header">
                                <h3>Vouchery sprzedane:</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSelectAll(issuedVouchers)}
                                    className="select-all-button"
                                >
                                    {issuedVouchers.every((v) => selectedIds.includes(v.id))
                                        ? "Odznacz wszystkie"
                                        : "Zaznacz wszystkie"}
                                </button>
                            </div>
                            <ul>
                                {issuedVouchers.map((voucher) => (
                                    <li key={voucher.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(voucher.id)}
                                                onChange={(e) =>
                                                    handleCheckboxChange(voucher.id, e.target.checked)
                                                }
                                            />
                                            {voucher.id} {voucher.voucherCode} -{" "}
                                            {new Date(voucher.saleDate).toLocaleDateString("pl")}{" "}
                                            {voucher.paymentMethod} {voucher.amount}zł {voucher.place}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {realizedVouchers.length > 0 && (
                        <div className="voucher-list">
                            <div className="voucher-list-header">
                                <h3>Vouchery zrealizowane:</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSelectAll(realizedVouchers)}
                                    className="select-all-button"
                                >
                                    {realizedVouchers.every((v) => selectedIds.includes(v.id))
                                        ? "Odznacz wszystkie"
                                        : "Zaznacz wszystkie"}
                                </button>
                            </div>
                            <ul>
                                {realizedVouchers.map((voucher) => (
                                    <li key={voucher.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(voucher.id)}
                                                onChange={(e) =>
                                                    handleCheckboxChange(voucher.id, e.target.checked)
                                                }
                                            />
                                            {voucher.id} {voucher.voucherCode} -{" "}
                                            {new Date(voucher.saleDate).toLocaleDateString("pl")}{" "}
                                            {voucher.paymentMethod} {voucher.amount}zł {voucher.place}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button onClick={handleGenerateReport}>
                        Generuj raport
                    </button>
                </div>

            )}

            {reportUrl && (
                <div className="report-link">
                    <a href={reportUrl} target="_blank" rel="noopener noreferrer">
                        Pobierz raport PDF
                    </a>
                </div>
            )}
        </div>
    );
};

export default ReportListGenerator;
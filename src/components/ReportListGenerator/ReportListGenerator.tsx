import React, { useState, useEffect } from "react";
import "./ReportListGenerator.css";
import {
    getVoucherByMonthAndYear,
    getVoucherRealizedByMonthAndYear
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
                getVoucherRealizedByMonthAndYear(Number(month), Number(year))
            ]);
            setIssuedVouchers(issuedResponse.data);
            setRealizedVouchers(realizedResponse.data);
            setSelectedIds([]); // czyścimy zaznaczenia przy nowym pobieraniu
        } catch (err) {
            setError("Nie udało się pobrać voucherów dla podanego miesiąca i roku.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(x => x !== id));
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
            // Przekazujemy również month i year do endpointa
            const response = await generateReportList(
                selectedIds,
                Number(month),
                Number(year)
            );
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            console.log("Otrzymany URL:", url);
            setReportUrl(url);
        } catch (err) {
            setError("Błąd podczas generowania raportu.");
            console.error(err);
        }
    };

    // Cleanup URL blob aby uniknąć wycieków pamięci
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
                        <option value="1">Styczeń</option>
                        <option value="2">Luty</option>
                        <option value="3">Marzec</option>
                        <option value="4">Kwiecień</option>
                        <option value="5">Maj</option>
                        <option value="6">Czerwiec</option>
                        <option value="7">Lipiec</option>
                        <option value="8">Sierpień</option>
                        <option value="9">Wrzesień</option>
                        <option value="10">Październik</option>
                        <option value="11">Listopad</option>
                        <option value="12">Grudzień</option>
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
                <>
                    {issuedVouchers.length > 0 && (
                        <div className="voucher-list">
                            <h3>Vouchery sprzedane:</h3>
                            <ul>
                                {issuedVouchers.map((voucher) => (
                                    <li key={voucher.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                onChange={(e) =>
                                                    handleCheckboxChange(voucher.id, e.target.checked)
                                                }
                                            />{" "}
                                            {voucher.id} {voucher.voucherCode} –{" "}
                                            {new Date(voucher.saleDate).toLocaleDateString()}{" "}
                                            {voucher.paymentMethod} {voucher.amount}zł {" "}
                                            {voucher.place}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {realizedVouchers.length > 0 && (
                        <div className="voucher-list">
                            <h3>Vouchery zrealizowane:</h3>
                            <ul>
                                {realizedVouchers.map((voucher) => (
                                    <li key={voucher.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                onChange={(e) =>
                                                    handleCheckboxChange(voucher.id, e.target.checked)
                                                }
                                            />{" "}
                                            {voucher.id} {voucher.voucherCode} –{" "}
                                            {new Date(voucher.saleDate).toLocaleDateString()}{" "}
                                            {voucher.paymentMethod} {voucher.amount}zł {" "}
                                            {voucher.place}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={handleGenerateReport}>Generuj raport</button>
                        </div>
                    )}
                </>
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

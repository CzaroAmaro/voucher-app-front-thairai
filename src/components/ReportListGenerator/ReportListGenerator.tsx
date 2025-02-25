import React, { useState } from "react";
import "./ReportListGenerator.css";
import { getVoucherByMonthAndYear } from "../../services/voucherService";
import { generateReportList } from "../../services/reportService";
import { Voucher } from "../../models/Voucher";

const ReportListGenerator: React.FC = () => {
    const [month, setMonth] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
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
            const response = await getVoucherByMonthAndYear(Number(month), Number(year));
            setVouchers(response.data);
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
            const response = await generateReportList(selectedIds);

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            console.log("Otrzymany URL:", url);
            setReportUrl(url);
        } catch (err) {
            setError("Błąd podczas generowania raportu.");
            console.error(err);
        }
    };

    return (
        <div className="report-list-generator">
            <h2>Generowanie raportu z wybranych voucherów</h2>
            <form onSubmit={handleFetchVouchers} className="fetch-form">
                <div className="form-group">
                    <label>Miesiąc:</label>
                    <input
                        type="number"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        placeholder="Miesiąc (1-12)"
                        required
                    />
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

            {vouchers.length > 0 && (
                <div className="voucher-list">
                    <h3>Wybierz vouchery do raportu:</h3>
                    <ul>
                        {vouchers.map((voucher) => (
                            <li key={voucher.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        onChange={(e) =>
                                            handleCheckboxChange(voucher.id, e.target.checked)
                                        }
                                    />{" "}
                                    {voucher.id}{" "}
                                    {voucher.voucherCode} –{" "}
                                    {new Date(voucher.saleDate).toLocaleDateString()}{" "}
                                    {voucher.paymentMethod}{" "}
                                    {voucher.amount}zł
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleGenerateReport}>Generuj raport</button>
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

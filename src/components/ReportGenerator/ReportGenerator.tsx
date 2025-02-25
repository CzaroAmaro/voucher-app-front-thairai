import React, { useState } from "react";
import "./ReportGenerator.css";
import { getReport } from "../../services/reportService";

const ReportGenerator: React.FC = () => {
    const [month, setMonth] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [reportUrl, setReportUrl] = useState<string>("");

    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await getReport(Number(month), Number(year));

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            setReportUrl(url);
        } catch (err) {
            console.error("Błąd przy generowaniu raportu:", err);
            setReportUrl("");
        }
    };

    return (
        <div className="report-generator">
            <h2>Generowanie raportu</h2>
            <form onSubmit={handleGenerateReport} className="report-form">
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
                        placeholder="Wpisz rok (np. 2025)"
                        required
                    />
                </div>
                <button type="submit">Generuj raport</button>
            </form>
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

export default ReportGenerator;

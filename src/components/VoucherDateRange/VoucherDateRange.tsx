import React, { useState } from "react";
import { getVoucherTwoDates } from "../../services/voucherService";
import { Voucher } from "../../models/Voucher";
import "./VoucherDateRange.css";

const VoucherDateRange: React.FC = () => {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [placeFilter, setPlaceFilter] = useState<string>("");
    const [realizedFilter, setRealizedFilter] = useState<string>("");
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!startDate || !endDate) {
            setError("Proszę wybrać obie daty.");
            return;
        }
        // Konwersja dat na składniki: dzień, miesiąc, rok
        const start = new Date(startDate);
        const end = new Date(endDate);
        const day1 = start.getDate();
        const month1 = start.getMonth() + 1;
        const year1 = start.getFullYear();
        const day2 = end.getDate();
        const month2 = end.getMonth() + 1;
        const year2 = end.getFullYear();

        setLoading(true);
        try {
            const response = await getVoucherTwoDates(day1, month1, year1, day2, month2, year2);
            let filtered: Voucher[] = response.data;

            // Filtrowanie po "miejsce"
            if (placeFilter) {
                filtered = filtered.filter((voucher: Voucher) => voucher.place === placeFilter);
            }
            // Filtrowanie po statusie "zrealizowany"
            if (realizedFilter) {
                filtered = filtered.filter((voucher: Voucher) => voucher.realized === realizedFilter);
            }
            setVouchers(filtered);
        } catch (err) {
            console.error("Błąd pobierania voucherów:", err);
            setError("Wystąpił błąd podczas pobierania voucherów.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="voucher-date-range-container">
            <h2 className="heading">Wyszukaj vouchery w wybranym okresie</h2>
            <form onSubmit={handleSearch} className="voucher-date-range-form">
                <div className="form-group">
                    <label>Data początkowa:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Data końcowa:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Miejsce:</label>
                    <select
                        value={placeFilter}
                        onChange={(e) => setPlaceFilter(e.target.value)}
                    >
                        <option value="">Wszystkie</option>
                        <option value="Ostrołęka">Ostrołęka</option>
                        <option value="Mława">Mława</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Zrealizowany:</label>
                    <select
                        value={realizedFilter}
                        onChange={(e) => setRealizedFilter(e.target.value)}
                    >
                        <option value="">Wszystkie</option>
                        <option value="Tak">Tak</option>
                        <option value="Nie">Nie</option>
                    </select>
                </div>
                <button type="submit">Pobierz vouchery</button>
            </form>
            {loading && <p>Ładowanie voucherów...</p>}
            {error && <p className="error">{error}</p>}
            {vouchers.length > 0 && (
                <div className="table-wrapper">
                    <table className="voucher-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Kod vouchera</th>
                            <th>Data sprzedaży</th>
                            <th>Metoda płatności</th>
                            <th>Kwota</th>
                            <th>Zrealizowany</th>
                            <th>Data realizacji</th>
                            <th>Pozostała kwota</th>
                            <th>Notatka</th>
                            <th>Ważny do</th>
                            <th>Miejsce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {vouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td>{voucher.id}</td>
                                <td>{voucher.voucherCode}</td>
                                <td>{new Date(voucher.saleDate).toLocaleDateString()}</td>
                                <td>{voucher.paymentMethod}</td>
                                <td>{voucher.amount} zł</td>
                                <td>{voucher.realized}</td>
                                <td>{voucher.realizedDate ? new Date(voucher.realizedDate).toLocaleDateString() : "Brak"}</td>
                                <td>{voucher.availableAmount} zł</td>
                                <td>{voucher.note}</td>
                                <td>{new Date(voucher.validUntil).toLocaleDateString()}</td>
                                <td>{voucher.place}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VoucherDateRange;

import React, { useState } from "react";
import {
    addVoucher,
    getVoucherById,
    getVoucherByCode,
    realizeVoucher,
} from "../../services/voucherService";
import { sendEmail } from "../../services/notificationService";
import { Voucher } from "../../models/Voucher";
import "./AddRealizeVoucher.css";

interface AddRealizeVoucherProps {
    onUpdate?: (updatedVoucher: Voucher) => void;
}

const AddRealizeVoucher: React.FC<AddRealizeVoucherProps> = ({ onUpdate }) => {
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState<string>("");
    const [howManyDaysAvailable, setHowManyDaysAvailable] = useState<number>(0);
    const [email, setEmail] = useState<string>("");
    const [userName, setUserName] = useState("");
    const [place, setPlace] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [voucherNode, setVoucherNode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [redemptionAmounts, setRedemptionAmounts] = useState<{ [key: number]: number }>({});

    const handleAddVoucher = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
            const response = await addVoucher({
                paymentMethod,
                amount,
                note,
                howManyDaysAvailable,
                place,
            });
            const newVoucher: Voucher = response.data;
            setVouchers((prev) => [newVoucher, ...prev]);

            if (email.trim()) {
                try {
                    const notifResponse = await sendEmail(
                        newVoucher.voucherCode,
                        email,
                        userName,
                        voucherNode
                    );
                    console.log(`Wiadomość wysłana: ${notifResponse.data.message}`);
                } catch (notifErr: any) {
                    console.error("Błąd przy wysyłaniu wiadomości:", notifErr);
                    setError("Voucher dodany, ale wysłanie wiadomości nie powiodło się.");
                }
            }
            setPaymentMethod("");
            setAmount(0);
            setNote("");
            setHowManyDaysAvailable(0);
            setEmail("");
            setUserName("");
            setVoucherNode("");
        } catch (err) {
            console.error("Błąd przy dodawaniu vouchera:", err);
            setError("Wystąpił błąd podczas dodawania vouchera.");
        }
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            let response;
            if (/^\d+$/.test(searchTerm)) {
                response = await getVoucherById(Number(searchTerm));
                setVouchers([response.data]);
            } else {
                response = await getVoucherByCode(searchTerm);
                const data = response.data;
                if (Array.isArray(data)) {
                    setVouchers(data);
                } else if (data) {
                    setVouchers([data]);
                } else {
                    setVouchers([]);
                }
            }
            if (Array.isArray(response.data) && response.data.length === 0) {
                setError("Nie znaleziono voucherów dla podanego kryterium.");
            }
        } catch (err) {
            console.error("Błąd podczas wyszukiwania:", err);
            setError("Wystąpił błąd podczas wyszukiwania.");
        } finally {
            setLoading(false);
        }
    };

    const handleRedemptionAmountChange = (id: number, value: number) => {
        setRedemptionAmounts((prev) => ({ ...prev, [id]: value }));
    };

    const handleRealize = async (voucherItem: Voucher) => {
        setError("");
        const redemptionAmount = redemptionAmounts[voucherItem.id] || 0;
        if (redemptionAmount <= 0) {
            setError("Kwota do realizacji musi być większa niż 0.");
            return;
        }
        if (redemptionAmount > voucherItem.amount) {
            setError("Kwota do realizacji nie może przekraczać dostępnej kwoty vouchera.");
            return;
        }
        const currentDate = new Date();
        const validUntilDate = new Date(voucherItem.validUntil);
        if (validUntilDate < currentDate) {
            const proceed = window.confirm(
                "Voucher jest przedawniony. Czy na pewno chcesz go zrealizować?"
            );
            if (!proceed) return;
        }
        try {
            const response = await realizeVoucher(voucherItem.voucherCode, redemptionAmount);
            if (onUpdate) {
                onUpdate(response.data);
            }
            console.log("Voucher zrealizowany pomyślnie!");
            setVouchers((prev) => prev.filter((v) => v.id !== voucherItem.id));
        } catch (err) {
            console.error("Błąd przy realizacji vouchera:", err);
            setError("Wystąpił błąd podczas realizacji vouchera.");
        }
    };

    return (
        <div className="voucher-container">
            <div className="add-voucher-container">
                <h2>Dodaj Voucher</h2>
                <form onSubmit={handleAddVoucher} className="add-voucher-form">
                    <div className="form-group">
                        <label>Metoda płatności:</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                        >
                            <option value="">Wybierz metodę</option>
                            <option value="Blik">Blik</option>
                            <option value="Gotówka">Gotówka</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Kwota</label>
                        <input
                            type="number"
                            value={amount === 0 ? "" : amount}
                            onChange={(e) =>
                                setAmount(e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            required
                            placeholder="Podaj kwotę"
                        />
                    </div>

                    <div className="form-group">
                        <label>Notatka</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            required
                            placeholder="Dodaj krótką notatkę"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ile dni voucher ma być dostępny</label>
                        <input
                            type="number"
                            value={howManyDaysAvailable === 0 ? "" : howManyDaysAvailable}
                            onChange={(e) =>
                                setHowManyDaysAvailable(
                                    e.target.value === "" ? 0 : Number(e.target.value)
                                )
                            }
                            required
                            placeholder="Podaj liczbę dni"
                        />
                    </div>

                    <div className="form-group">
                        <label>Miejsce:</label>
                        <select
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                            required
                        >
                            <option value="">Wybierz miejsce</option>
                            <option value="Ostrołęka">Ostrołęka</option>
                            <option value="Mława">Mława</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Email klienta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Podaj adres email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Dla kogo</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Podaj dla kogo ma być wystawiony voucher"
                        />
                    </div>
                    <div className="form-group">
                        <label>Informacja na voucherze</label>
                        <input
                            type="text"
                            value={voucherNode}
                            onChange={(e) => setVoucherNode(e.target.value)}
                            placeholder="Podaj informacje o usłudze na voucherze."
                        />
                    </div>

                    <button type="submit">Dodaj Voucher</button>
                </form>

                {error && <p className="error">{error}</p>}

                {vouchers.length > 0 && (
                    <div className="voucher-list">
                        <h3>Dodane vouchery</h3>
                        <table className="voucher-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kod</th>
                                <th>Data sprzedaży</th>
                                <th>Metoda płatności</th>
                                <th>Kwota</th>
                                <th>Pozostała kwota</th>
                                <th>Notatka</th>
                                <th>Ważny do</th>
                                <th>Miejsce</th>
                            </tr>
                            </thead>
                            <tbody>
                            {vouchers.map((voucherItem) => (
                                <tr key={voucherItem.id}>
                                    <td>{voucherItem.id}</td>
                                    <td>{voucherItem.voucherCode}</td>
                                    <td>{new Date(voucherItem.saleDate).toLocaleDateString()}</td>
                                    <td>{voucherItem.paymentMethod}</td>
                                    <td>{voucherItem.amount}</td>
                                    <td>{voucherItem.availableAmount}</td>
                                    <td>{voucherItem.note}</td>
                                    <td>{new Date(voucherItem.validUntil).toLocaleDateString()}</td>
                                    <td>{voucherItem.place}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="search-voucher-section">
                <h2>Wyszukaj i Zrealizuj Voucher</h2>
                <form onSubmit={handleSearch} className="voucher-form">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Wprowadź ID lub kod vouchera"
                    />
                    <button type="submit">Szukaj</button>
                </form>
                {loading && <p>Ładowanie...</p>}
                {error && <p className="error">{error}</p>}
                {vouchers.length > 0 && (
                    <table className="voucher-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Kod</th>
                            <th>Data sprzedaży</th>
                            <th>Metoda płatności</th>
                            <th>Kwota</th>
                            <th>Pozostała kwota</th>
                            <th>Notatka</th>
                            <th>Ważny do</th>
                            <th>Miejsce</th>
                            <th>Kwota do realizacji</th>
                            <th>Akcja</th>
                        </tr>
                        </thead>
                        <tbody>
                        {vouchers.map((voucherItem) => (
                            <tr key={voucherItem.id}>
                                <td>{voucherItem.id}</td>
                                <td>{voucherItem.voucherCode}</td>
                                <td>{new Date(voucherItem.saleDate).toLocaleDateString()}</td>
                                <td>{voucherItem.paymentMethod}</td>
                                <td>{voucherItem.amount}</td>
                                <td>{voucherItem.availableAmount}</td>
                                <td>{voucherItem.note}</td>
                                <td>{new Date(voucherItem.validUntil).toLocaleDateString()}</td>
                                <td>{voucherItem.place}</td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Kwota"
                                        value={
                                            redemptionAmounts[voucherItem.id] === 0
                                                ? ""
                                                : redemptionAmounts[voucherItem.id] || ""
                                        }
                                        onChange={(e) =>
                                            handleRedemptionAmountChange(
                                                voucherItem.id,
                                                e.target.value === "" ? 0 : Number(e.target.value)
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleRealize(voucherItem)}>
                                        Zrealizuj
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AddRealizeVoucher;

// src/components/addVoucher/AddVoucher.tsx
import React, { useState } from "react";
import { addVoucher } from "../../services/voucherService";
import "./AddVoucher.css";

const AddVoucher: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState("");
    const [howManyDaysAvailable, setHowManyDaysAvailable] = useState<number>(0);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
             await addVoucher({
                paymentMethod,
                amount,
                note,
                howManyDaysAvailable,
            });
             window.alert("Voucher dodany pomyślnie!");
            setPaymentMethod("");
            setAmount(0);
            setNote("");
            setHowManyDaysAvailable(0);
        } catch (err) {
            console.error("Błąd przy dodawaniu vouchera:", err);
            setError("Wystąpił błąd podczas dodawania vouchera.");
        }
    };

    return (
        <div className="add-voucher-container">
            <h2>Dodaj Voucher</h2>
            <form onSubmit={handleSubmit} className="add-voucher-form">
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
                    <label>Kwota:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Notatka:</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Ile dni voucher ma być dostępny:</label>
                    <input
                        type="number"
                        value={howManyDaysAvailable}
                        onChange={(e) =>
                            setHowManyDaysAvailable(Number(e.target.value))
                        }
                        required
                    />
                </div>
                <button type="submit">Dodaj Voucher</button>
            </form>

            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default AddVoucher;

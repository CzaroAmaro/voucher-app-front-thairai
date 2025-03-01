import React, { useState } from "react";
import { addVoucher } from "../../services/voucherService";
import { sendEmail } from "../../services/notificationService.ts";
import "./AddVoucher.css";

const AddVoucher: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState("");
    const [howManyDaysAvailable, setHowManyDaysAvailable] = useState<number>(0);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const response = await addVoucher({
                paymentMethod,
                amount,
                note,
                howManyDaysAvailable,
            });
            const newVoucher = response.data;

            if (email.trim()) {
                try {
                    const notifResponse = await sendEmail(newVoucher.voucherCode, email);
                    window.alert(`Voucher dodany pomyślnie! ${notifResponse.data.message}`);
                } catch (notifErr: any) {
                    console.error("Błąd przy wysyłaniu wiadomości:", notifErr);
                    window.alert("Voucher dodany, ale wysłanie wiadomości nie powiodło się.");
                }
            } else {
                window.alert("Voucher dodany pomyślnie!");
            }

            // Resetowanie pól formularza
            setPaymentMethod("");
            setAmount(0);
            setNote("");
            setHowManyDaysAvailable(0);
            setEmail("");
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
                    <label>Email klienta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Podaj adres email"
                    />
                </div>

                <button type="submit">Dodaj Voucher</button>
            </form>

            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default AddVoucher;

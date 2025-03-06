import React, { useState } from 'react';
import { deleteVoucher, realizeVoucher, editVoucher } from "../../services/voucherService";
import { Voucher } from "../../models/Voucher";
import "./VoucherModal.css";
import { sendEmail } from "../../services/notificationService";

interface VoucherModalProps {
    voucher: Voucher;
    onClose: () => void;
    onUpdate?: (updateVoucher: Voucher) => void;
    onDelete?: (id: number) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({ voucher, onClose, onUpdate, onDelete }) => {
    // Stany dla zakładki "Realizacja"
    const [amount, setAmount] = useState<number>(voucher.amount);
    const [error, setError] = useState<string>("");

    // Stany dla zakładki "Usuwanie"
    const [deleteOption, setDeleteOption] = useState<string>("");
    const [customDeleteReason, setCustomDeleteReason] = useState<string>("");

    // Inne stany
    const [activeTab, setActiveTab] = useState<"realizacja" | "usuwanie" | "wysylka" | "edycja">("realizacja");
    const [emailAddress, setEmailAddress] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [voucherNote, setVoucherNote] = useState<string>("");

    // Stany dla zakładki "Edycja"
    const [editPaymentMethod, setEditPaymentMethod] = useState<string>(voucher.paymentMethod);
    const [editAmount, setEditAmount] = useState<number>(voucher.amount);
    const [editNote, setEditNote] = useState<string>(voucher.note);
    const [editAvailableAmount, setEditAvailableAmount] = useState<number>(voucher.availableAmount);
    // Checkbox do cofnięcia statusu – dostępny tylko, gdy voucher jest zrealizowany
    const [markAsNotRealized, setMarkAsNotRealized] = useState<boolean>(false);

    const handleRealize = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const currentDate = new Date();
        const validUntilDate = new Date(voucher.validUntil);
        if (validUntilDate < currentDate) {
            const proceed = window.confirm("Voucher jest przedawniony. Czy na pewno chcesz go zrealizować?");
            if (!proceed) return;
        }
        try {
            const response = await realizeVoucher(voucher.voucherCode, amount);
            if (onUpdate) onUpdate(response.data);
            onClose();
            window.alert("Voucher zrealizowany pomyślnie!");
        } catch (err) {
            console.error("Błąd przy realizacji vouchera:", err);
            setError("Wystąpił błąd podczas realizacji vouchera.");
        }
    };

    const handleDelete = async () => {
        setError("");
        const reasonToSend = deleteOption === "inny" ? customDeleteReason : deleteOption;
        if (!reasonToSend.trim()) {
            setError("Proszę podać powód usunięcia.");
            return;
        }
        if (!voucher.id) {
            setError("Voucher nie posiada id.");
            return;
        }
        if (window.confirm("Czy na pewno chcesz usunąć voucher?")) {
            try {
                await deleteVoucher(voucher.id, reasonToSend);
                if (onDelete) onDelete(voucher.id);
                onClose();
                window.alert("Voucher usunięty pomyślnie!");
            } catch (err) {
                console.error("Błąd przy usuwaniu vouchera:", err);
                setError("Wystąpił błąd podczas usuwania vouchera.");
            }
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!emailAddress.trim()) {
            setError("Proszę podać adres email.");
            return;
        }
        try {
            const response = await sendEmail(voucher.voucherCode, emailAddress, userName, voucherNote);
            window.alert(response.data.message || "Voucher wysłany pomyślnie!");
            onClose();
        } catch (err) {
            console.error("Błąd przy wysyłaniu vouchera:", err);
            setError("Wystąpił błąd podczas wysyłania vouchera.");
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!voucher.id) {
            setError("Voucher nie posiada id.");
            return;
        }
        try {
            // Domyślne wartości na podstawie aktualnych danych vouchera
            let newRealized = voucher.realized;
            let newRealizedDate = voucher.realizedDate || "";
            // Jeśli voucher jest zrealizowany i checkbox został zaznaczony, cofamy realizację
            if (voucher.realized === "Tak" && markAsNotRealized) {
                newRealized = "Nie";
                newRealizedDate = "Brak";
            }
            const response = await editVoucher(voucher.id, {
                paymentMethod: editPaymentMethod,
                amount: editAmount,
                realized: newRealized,
                realizedDate: newRealizedDate,
                note: editNote,
                availableAmount: editAvailableAmount,
            });
            if (onUpdate) onUpdate(response.data);
            onClose();
            window.alert("Voucher zaktualizowany pomyślnie!");
        } catch (err) {
            console.error("Błąd przy edycji vouchera:", err);
            setError("Wystąpił błąd podczas edycji vouchera.");
        }
    };

    return (
        <div className="voucher-modal">
            <div className="modal">
                <button className="close-button" onClick={onClose}>X</button>
                <div className="modal-tabs">
                    <button className={activeTab === "realizacja" ? "active" : ""} onClick={() => setActiveTab("realizacja")}>
                        Realizacja
                    </button>
                    <button className={activeTab === "usuwanie" ? "active" : ""} onClick={() => setActiveTab("usuwanie")}>
                        Usuwanie
                    </button>
                    <button className={activeTab === "wysylka" ? "active" : ""} onClick={() => setActiveTab("wysylka")}>
                        Wysyłka
                    </button>
                    <button className={activeTab === "edycja" ? "active" : ""} onClick={() => setActiveTab("edycja")}>
                        Edycja
                    </button>
                </div>

                {activeTab === "realizacja" && (
                    <form onSubmit={handleRealize}>
                        <h2>Realizacja Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal" />
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
                        {error && <p className="error">{error}</p>}
                        <div className="modal-buttons">
                            <button type="submit">Realizuj Voucher</button>
                        </div>
                    </form>
                )}

                {activeTab === "usuwanie" && (
                    <div>
                        <h2>Usuwanie Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal" />
                        </div>
                        <div className="form-group">
                            <label>Powód usunięcia:</label>
                            <select value={deleteOption} onChange={(e) => setDeleteOption(e.target.value)} required>
                                <option value="">Wybierz powód</option>
                                <option value="wystawiony omyłkowo">Wystawiony omyłkowo</option>
                                <option value="niepoprawna kwota">Niepoprawna kwota</option>
                                <option value="duplikat">Duplikat</option>
                                <option value="anulowana transakcja">Anulowana transakcja</option>
                                <option value="inny">Inny</option>
                            </select>
                        </div>
                        {deleteOption === "inny" && (
                            <div className="form-group">
                                <label>Podaj powód:</label>
                                <input
                                    type="text"
                                    value={customDeleteReason}
                                    onChange={(e) => setCustomDeleteReason(e.target.value)}
                                    placeholder="Podaj powód usunięcia"
                                    required
                                />
                            </div>
                        )}
                        {error && <p className="error">{error}</p>}
                        <div className="modal-buttons">
                            <button type="button" onClick={handleDelete}>Usuń Voucher</button>
                        </div>
                    </div>
                )}

                {activeTab === "wysylka" && (
                    <form onSubmit={handleSendEmail}>
                        <h2>Wysyłka Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal" />
                        </div>
                        <div className="form-group">
                            <label>Adres Email:</label>
                            <input
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="Podaj Adres Email"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Dla kogo:</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Podaj dla kogo ma być wystawiony voucher"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Informacja na voucherze:</label>
                            <input
                                type="text"
                                value={voucherNote}
                                onChange={(e) => setVoucherNote(e.target.value)}
                                placeholder="Podaj informacje o usłudze na voucherze."
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="modal-buttons">
                            <button type="submit">Wyślij Voucher</button>
                        </div>
                    </form>
                )}

                {activeTab === "edycja" && (
                    <form onSubmit={handleEdit}>
                        <h2>Edycja Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal" />
                        </div>
                        <div className="form-group">
                            <label>Sposób płatności:</label>
                            <input
                                type="text"
                                value={editPaymentMethod}
                                onChange={(e) => setEditPaymentMethod(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Kwota:</label>
                            <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Notatka:</label>
                            <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Dostępna kwota:</label>
                            <input
                                type="number"
                                value={editAvailableAmount}
                                onChange={(e) => setEditAvailableAmount(Number(e.target.value))}
                                required
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="modal-buttons">
                            <button type="submit">Zaktualizuj Voucher</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VoucherModal;

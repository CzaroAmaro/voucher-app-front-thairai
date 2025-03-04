import React, {useState} from 'react';
import {deleteVoucher, realizeVoucher} from "../../services/voucherService.ts";
import {Voucher} from "../../models/Voucher.ts";
import "./VoucherModal.css";
import {sendEmail} from "../../services/notificationService.ts";

interface VoucherModalProps {
    voucher: Voucher;
    onClose: () => void;
    onUpdate?: (updateVoucher: Voucher) => void;
    onDelete?: (id: number) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({voucher, onClose, onUpdate, onDelete}) => {
    const [amount, setAmount] = useState<number>(voucher.amount);
    const [error, setError] = useState<string>("");
    const [deleteOption, setDeleteOption] = useState<string>("");
    const [customDeleteReason, setCustomDeleteReason] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"realizacja" | "usuwanie" | "wysylka" >("realizacja");
    const [emailAddress, setEmailAddress] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [voucherNode, setVoucherNode] = useState<string>("");

    const handleRealize = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const currentDate = new Date();
        const validUntilDate = new Date(voucher.validUntil);
        if (validUntilDate < currentDate) {
            const proceed = window.confirm(
                "Voucher jest przedawniony. Czy na pewno chcesz go zrealizować?"
            );
            if(!proceed){
                return;
            }
        }
        try{
            const response = await realizeVoucher(voucher.voucherCode, amount);
            if (onUpdate) {
                onUpdate(response.data);
            }
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
        if(!reasonToSend.trim()){
            setError("Proszę podać powód usunięcia.");
            return;
        }
        if (voucher.id === null) {
            setError("Voucher nie posiada id:");
            return;
        }
        if (window.confirm("Czy na pewno chcesz usunąć voucher?")){
            try{
                await deleteVoucher(voucher.id, reasonToSend);
                if (onDelete){
                    onDelete(voucher.id);
                }
                onClose();
                window.alert("Voucher usunięty pomyślnie!");
            }catch(err: any){
                console.error("Błąd przy usuwaniu vouchera:", err);
                setError("Wystąpił błąd podczas usuwania vouchera.");
            }
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
    if (!emailAddress.trim()){
        setError("Proszę podać adres email.");
        return;
    }
    try{
        const response = await sendEmail(voucher.voucherCode, emailAddress, userName, voucherNode);
        window.alert(response.data.message || "Voucher wysłany pomyślnie!");
        onClose();
    } catch (err: any){
        console.error("Błąd przy wysyłaniu vouchera:", err);
        setError("Wystąpił błąd podczas usuwania vouchera.");
     }
    };
    return (
        <div className="voucher-modal">
            <div className="modal">
                <button className="close-button" onClick={onClose}>X</button>
                <div className="modal-tabs">
                    <button
                        className={activeTab === "realizacja" ? "active" : ""}
                        onClick={() => setActiveTab("realizacja")}
                    >
                        Realizacja
                    </button>
                    <button
                        className={activeTab === "usuwanie" ? "active" : ""}
                        onClick={() => setActiveTab("usuwanie")}
                    >
                        Usuwanie
                    </button>
                    <button
                        className={activeTab === "wysylka" ? "active" : ""}
                        onClick={() => setActiveTab("wysylka")}
                    >
                        Wysyłka
                    </button>
                </div>

                {activeTab === "realizacja" && (
                    <form onSubmit={handleRealize}>
                        <h2>Realizacja Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal"/>
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
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal"/>
                        </div>
                        <div className="form-group">
                            <label>Powód usunięcia:</label>
                            <select
                                value={deleteOption}
                                onChange={(e) => setDeleteOption(e.target.value)}
                                required>
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
                                    required/>
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
                            <input type="text" value={voucher.voucherCode} disabled className="voucher-code-modal"/>
                        </div>
                        <div className="form-group">
                            <label>Adres Email:</label>
                            <input
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="Podaj Adres Email"
                                required/>
                        </div>
                        <div className="form-group">
                            <label>Dla kogo</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Podaj dla kogo ma być wystawiony voucher"
                                required
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
                        {error && <p className="error">{error}</p>}
                        <div className="modal-buttons">
                            <button type="submit">Wyślij Voucher</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VoucherModal;
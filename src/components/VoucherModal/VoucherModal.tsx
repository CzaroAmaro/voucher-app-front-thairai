import React, {useState} from 'react';
import {deleteVoucher, realizeVoucher} from "../../services/voucherService.ts";
import {Voucher} from "../../models/Voucher.ts";
import "./VoucherModal.css";

interface VoucherModalProps {
    voucher: Voucher;
    onClose: () => void;
    onUpdate?: (updateVoucher: Voucher) => void;
    onDelete?: (id: number) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({voucher, onClose, onUpdate, onDelete}) => {
    const [amount, setAmount] = useState<number>(voucher.amount);
    const [error, setError] = useState<string>("");
    const [deleteReason, setDeleteReason] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"realizacja" | "usuwanie" >("realizacja");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
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
        if(!deleteReason.trim()){
            setError("Proszę podać powód usunięcia.");
            return;
        }
        if (voucher.id === null) {
            setError("Voucher nie posiada id:");
            return;
        }
        if (window.confirm("Czy na pewno chcesz usunąć voucher?")){
            try{
                await deleteVoucher(voucher.id, deleteReason);
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
    return (
        <div className="voucher-modal">
            <div className="modal">
                {/* Zakładki u góry modala */}
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
                </div>

                {activeTab === "realizacja" && (
                    <form onSubmit={handleSubmit}>
                        <h2>Realizacja Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled />
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
                            <button type="button" onClick={onClose}>Anuluj</button>
                        </div>
                    </form>
                )}

                {activeTab === "usuwanie" && (
                    <div>
                        <h2>Usuwanie Vouchera</h2>
                        <div className="form-group">
                            <label>Kod vouchera:</label>
                            <input type="text" value={voucher.voucherCode} disabled />
                        </div>
                        <div className="form-group">
                            <label>Powód usunięcia:</label>
                            <input
                                type="text"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Podaj powód usunięcia"
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="modal-buttons">
                            <button type="button" onClick={handleDelete}>Usuń Voucher</button>
                            <button type="button" onClick={onClose}>Anuluj</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoucherModal;
import React, {useState} from 'react';
import {realizeVoucher} from "../../services/voucherService.ts";
import "./VoucherModal.css";

interface Voucher {
    id: number | null;
    voucherCode: string;
    saleDate: string;
    paymentMethod: string;
    amount: number;
    realized: string;
    realizedDate: string | null;
    note: string;
    availableAmount: number;
    validUntil: string;
}

interface VoucherModalProps {
    voucher: Voucher;
    onClose: () => void;
    onUpdate?: (updateVoucher: Voucher) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({voucher, onClose, onUpdate}) => {
    const [amount, setAmount] = useState<number>(voucher.amount);
    const [error, setError] = useState<string>("");

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
    return (
        <div className="voucher-modal">
            <div className="modal">
                <h2>Realizacja Vouchera</h2>
                <form onSubmit={handleSubmit}>
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
                    <button type='submit'> Realizuj Voucher</button>
                    <button type="button" onClick={onClose}>Anuluj</button>
                </div>
                </form>
            </div>
        </div>
    );
};

export default VoucherModal;
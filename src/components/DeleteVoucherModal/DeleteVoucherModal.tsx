import React, {useState} from 'react';
import {deleteVoucherPermanently} from "../../services/voucherService.ts";
import {Voucher} from "../../models/Voucher.ts";
import "./DeleteVoucherModal.css";

interface DeleteVoucherModalProps {
    voucher: Voucher;
    onClose: () => void;
    onDelete?: (id: number) => void;
}

const DeleteVoucherModal: React.FC<DeleteVoucherModalProps> = ({voucher, onClose,onDelete}) => {
    const [error, setError] = useState<string>("");

    const handleDelete = async () => {
        if (voucher.id === null) {
            setError("Voucher nie posiada id:");
            return;
        }
        if (window.confirm("Czy na pewno chcesz usunąć voucher?")){
            try{
                await deleteVoucherPermanently(voucher.id);
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
                <h2>Usuń voucher na zawsze!</h2>
                    <div className="form-group">
                    {error && <p className="error">{error}</p>}
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Anuluj</button>
                        <button type="button" onClick={handleDelete}>Usuń Voucher</button>
                    </div>
                    </div>
            </div>
        </div>
    );
};

export default DeleteVoucherModal;
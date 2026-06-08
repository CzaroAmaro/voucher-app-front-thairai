import React, { useEffect, useState } from "react";
import { deleteVoucher, realizeVoucher, editVoucher } from "../../services/voucherService";
import { sendEmail } from "../../services/notificationService";
import { Voucher } from "../../models/Voucher";
import { formatCurrency, formatDate, isExpired, isVoucherRealized } from "../../utils/voucher";
import "./VoucherModal.css";

type Tab = "realize" | "edit" | "send" | "delete";

const PAYMENT_METHODS = ["Blik", "Gotówka"] as const;
const DELETE_REASONS = [
    "wystawiony omyłkowo",
    "niepoprawna kwota",
    "duplikat",
    "anulowana transakcja",
] as const;

interface VoucherModalProps {
    voucher: Voucher;
    onClose: () => void;
    onUpdate?: (updatedVoucher: Voucher) => void;
    onDelete?: (id: number) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({ voucher, onClose, onUpdate, onDelete }) => {
    const realized = isVoucherRealized(voucher);
    const expired = !realized && isExpired(voucher.validUntil);

    const [activeTab, setActiveTab] = useState<Tab>("realize");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // Realizacja
    const [redeemAmount, setRedeemAmount] = useState("");

    // Edycja
    const [editPaymentMethod, setEditPaymentMethod] = useState(voucher.paymentMethod);
    const [editAmount, setEditAmount] = useState(String(voucher.amount));
    const [editNote, setEditNote] = useState(voucher.note ?? "");
    const [editAvailableAmount, setEditAvailableAmount] = useState(String(voucher.availableAmount));
    const [revertRealization, setRevertRealization] = useState(false);

    // Wysyłka
    const [emailAddress, setEmailAddress] = useState("");
    const [userName, setUserName] = useState("");
    const [voucherNote, setVoucherNote] = useState("");

    // Usuwanie
    const [deleteReason, setDeleteReason] = useState("");
    const [customDeleteReason, setCustomDeleteReason] = useState("");

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const switchTab = (tab: Tab) => {
        setActiveTab(tab);
        setError("");
    };

    const handleRealize = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const value = Number(redeemAmount);
        if (!Number.isFinite(value) || value <= 0) {
            setError("Kwota realizacji musi być większa od zera.");
            return;
        }
        if (value > voucher.availableAmount) {
            setError(`Kwota nie może przekraczać pozostałych ${formatCurrency(voucher.availableAmount)}.`);
            return;
        }
        if (expired && !window.confirm("Voucher jest przedawniony. Zrealizować mimo to?")) return;

        setBusy(true);
        try {
            const { data } = await realizeVoucher(voucher.voucherCode, value);
            onUpdate?.(data);
            onClose();
        } catch (err) {
            console.error("Błąd przy realizacji vouchera:", err);
            setError("Wystąpił błąd podczas realizacji vouchera.");
        } finally {
            setBusy(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const amountValue = Number(editAmount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setError("Kwota musi być większa od zera.");
            return;
        }
        const availableValue = Number(editAvailableAmount);
        if (!revertRealization && (!Number.isFinite(availableValue) || availableValue < 0 || availableValue > amountValue)) {
            setError("Pozostała kwota musi mieścić się w przedziale 0 – kwota vouchera.");
            return;
        }

        setBusy(true);
        try {
            const { data } = await editVoucher(voucher.id, {
                paymentMethod: editPaymentMethod,
                amount: amountValue,
                realized: revertRealization ? "Nie" : voucher.realized,
                realizedDate: revertRealization ? null : (voucher.realizedDate ?? null),
                note: editNote,
                availableAmount: revertRealization ? amountValue : availableValue,
            });
            onUpdate?.(data);
            onClose();
        } catch (err) {
            console.error("Błąd przy edycji vouchera:", err);
            setError("Wystąpił błąd podczas edycji vouchera.");
        } finally {
            setBusy(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!emailAddress.trim()) {
            setError("Podaj adres e-mail.");
            return;
        }
        setBusy(true);
        try {
            await sendEmail(voucher.voucherCode, emailAddress.trim(), userName, voucherNote);
            onClose();
        } catch (err) {
            console.error("Błąd przy wysyłaniu vouchera:", err);
            setError("Wystąpił błąd podczas wysyłania vouchera.");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setError("");
        const reason = deleteReason === "inny" ? customDeleteReason.trim() : deleteReason;
        if (!reason) {
            setError("Podaj powód usunięcia.");
            return;
        }
        if (!window.confirm("Czy na pewno chcesz usunąć voucher?")) return;

        setBusy(true);
        try {
            await deleteVoucher(voucher.id, reason);
            onDelete?.(voucher.id);
            onClose();
        } catch (err) {
            console.error("Błąd przy usuwaniu vouchera:", err);
            setError("Wystąpił błąd podczas usuwania vouchera.");
        } finally {
            setBusy(false);
        }
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: "realize", label: "Realizacja" },
        { id: "edit", label: "Edycja" },
        { id: "send", label: "Wysyłka" },
        { id: "delete", label: "Usuwanie" },
    ];

    return (
        <div
            className="vm-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="vm-modal" role="dialog" aria-modal="true" aria-label="Szczegóły vouchera">
                <div className="vm-head">
                    <div className="vm-head__title">
                        <code className="vm-code">{voucher.voucherCode}</code>
                        {realized ? (
                            <span className="vm-badge vm-badge--muted">Zrealizowany</span>
                        ) : expired ? (
                            <span className="vm-badge vm-badge--warn">Przedawniony</span>
                        ) : (
                            <span className="vm-badge vm-badge--success">Aktywny</span>
                        )}
                    </div>
                    <button type="button" className="vm-close" onClick={onClose} aria-label="Zamknij">
                        ✕
                    </button>
                </div>

                <div className="vm-summary">
                    <span>Pozostało: <strong>{formatCurrency(voucher.availableAmount)}</strong></span>
                    <span>z {formatCurrency(voucher.amount)}</span>
                    <span>Ważny do {formatDate(voucher.validUntil)}</span>
                    <span>{voucher.place || "—"}</span>
                </div>

                <div className="vm-tabs" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            className={`vm-tab ${activeTab === tab.id ? "is-active" : ""}`}
                            onClick={() => switchTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="vm-body">
                    {activeTab === "realize" && (
                        <form onSubmit={handleRealize} className="vm-form">
                            {realized ? (
                                <p className="vm-info">Voucher został w całości zrealizowany.</p>
                            ) : (
                                <div className="vm-field">
                                    <label htmlFor="vm-redeem">Kwota do realizacji (zł)</label>
                                    <input
                                        id="vm-redeem"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        max={voucher.availableAmount}
                                        value={redeemAmount}
                                        onChange={(e) => setRedeemAmount(e.target.value)}
                                        placeholder={`maks. ${voucher.availableAmount}`}
                                        autoFocus
                                    />
                                </div>
                            )}
                            {error && <p className="vm-error" role="alert">{error}</p>}
                            {!realized && (
                                <div className="vm-actions">
                                    <button type="submit" className="vm-btn vm-btn--primary" disabled={busy}>
                                        {busy ? "Realizuję…" : "Zrealizuj"}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {activeTab === "edit" && (
                        <form onSubmit={handleEdit} className="vm-form">
                            <div className="vm-grid">
                                <div className="vm-field">
                                    <label htmlFor="vm-payment">Metoda płatności</label>
                                    <select
                                        id="vm-payment"
                                        value={editPaymentMethod}
                                        onChange={(e) => setEditPaymentMethod(e.target.value)}
                                        required
                                    >
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="vm-field">
                                    <label htmlFor="vm-amount">Kwota (zł)</label>
                                    <input
                                        id="vm-amount"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="vm-field">
                                    <label htmlFor="vm-available">Pozostała kwota (zł)</label>
                                    <input
                                        id="vm-available"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={revertRealization ? editAmount : editAvailableAmount}
                                        onChange={(e) => setEditAvailableAmount(e.target.value)}
                                        disabled={revertRealization}
                                    />
                                </div>
                                <div className="vm-field">
                                    <label htmlFor="vm-note">Notatka</label>
                                    <input
                                        id="vm-note"
                                        type="text"
                                        value={editNote}
                                        onChange={(e) => setEditNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            {realized && (
                                <label className="vm-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={revertRealization}
                                        onChange={(e) => setRevertRealization(e.target.checked)}
                                    />
                                    Cofnij realizację (przywróci pełną kwotę vouchera)
                                </label>
                            )}

                            {error && <p className="vm-error" role="alert">{error}</p>}
                            <div className="vm-actions">
                                <button type="submit" className="vm-btn vm-btn--primary" disabled={busy}>
                                    {busy ? "Zapisuję…" : "Zapisz zmiany"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === "send" && (
                        <form onSubmit={handleSend} className="vm-form">
                            <div className="vm-field">
                                <label htmlFor="vm-email">Adres e-mail</label>
                                <input
                                    id="vm-email"
                                    type="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    placeholder="adres@email.pl"
                                    required
                                />
                            </div>
                            <div className="vm-field">
                                <label htmlFor="vm-recipient">Dla kogo</label>
                                <input
                                    id="vm-recipient"
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Imię obdarowanej osoby"
                                />
                            </div>
                            <div className="vm-field">
                                <label htmlFor="vm-vnote">Informacja na voucherze</label>
                                <input
                                    id="vm-vnote"
                                    type="text"
                                    value={voucherNote}
                                    onChange={(e) => setVoucherNote(e.target.value)}
                                    placeholder="np. rodzaj usługi"
                                />
                            </div>
                            {error && <p className="vm-error" role="alert">{error}</p>}
                            <div className="vm-actions">
                                <button type="submit" className="vm-btn vm-btn--primary" disabled={busy}>
                                    {busy ? "Wysyłam…" : "Wyślij voucher"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === "delete" && (
                        <div className="vm-form">
                            <div className="vm-field">
                                <label htmlFor="vm-reason">Powód usunięcia</label>
                                <select
                                    id="vm-reason"
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                >
                                    <option value="">Wybierz powód</option>
                                    {DELETE_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </option>
                                    ))}
                                    <option value="inny">Inny</option>
                                </select>
                            </div>
                            {deleteReason === "inny" && (
                                <div className="vm-field">
                                    <label htmlFor="vm-custom-reason">Podaj powód</label>
                                    <input
                                        id="vm-custom-reason"
                                        type="text"
                                        value={customDeleteReason}
                                        onChange={(e) => setCustomDeleteReason(e.target.value)}
                                        placeholder="Powód usunięcia"
                                    />
                                </div>
                            )}
                            {error && <p className="vm-error" role="alert">{error}</p>}
                            <div className="vm-actions">
                                <button
                                    type="button"
                                    className="vm-btn vm-btn--danger"
                                    onClick={handleDelete}
                                    disabled={busy}
                                >
                                    {busy ? "Usuwam…" : "Usuń voucher"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherModal;

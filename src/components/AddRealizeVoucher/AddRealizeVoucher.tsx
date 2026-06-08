import React, { useState } from "react";
import {
    addVoucher,
    getVoucherById,
    getVoucherByCode,
    realizeVoucher,
} from "../../services/voucherService";
import { sendEmail } from "../../services/notificationService";
import { Voucher } from "../../models/Voucher";
import { formatCurrency, formatDate, isExpired, isVoucherRealized } from "../../utils/voucher";
import Alert from "../Alert/Alert";
import "./AddRealizeVoucher.css";

type Tab = "add" | "realize";

const PLACES = ["Ostrołęka", "Ostrołęka-2", "Mława"] as const;
const PAYMENT_METHODS = ["Blik", "Gotówka"] as const;
const DEFAULT_NOTE = "Usługa masażu";
const DEFAULT_DAYS = 180;

const AddRealizeVoucher: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>("add");
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // --- Zakładka "Dodaj" ---
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState(DEFAULT_NOTE);
    const [daysValid, setDaysValid] = useState(String(DEFAULT_DAYS));
    const [place, setPlace] = useState("");
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [voucherNote, setVoucherNote] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState("");
    const [lastAdded, setLastAdded] = useState<Voucher | null>(null);

    // --- Zakładka "Realizuj" ---
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<Voucher[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [redemptionInputs, setRedemptionInputs] = useState<Record<number, string>>({});
    const [redeemingId, setRedeemingId] = useState<number | null>(null);

    const resetAddForm = () => {
        setPaymentMethod("");
        setAmount("");
        setNote(DEFAULT_NOTE);
        setDaysValid(String(DEFAULT_DAYS));
        setPlace("");
        setEmail("");
        setUserName("");
        setVoucherNote("");
    };

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAddError("");

        const amountValue = Number(amount);
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setAddError("Podaj poprawną kwotę większą od zera.");
            return;
        }
        const daysValue = Number(daysValid);
        const normalizedDays =
            Number.isFinite(daysValue) && daysValue > 0 ? daysValue : DEFAULT_DAYS;

        setIsAdding(true);
        try {
            const { data: newVoucher } = await addVoucher({
                paymentMethod,
                amount: amountValue,
                note,
                howManyDaysAvailable: normalizedDays,
                place,
            });
            setLastAdded(newVoucher);

            let message = `Voucher dodany pomyślnie. Kod: ${newVoucher.voucherCode}.`;
            const recipient = email.trim();
            if (recipient) {
                try {
                    await sendEmail(newVoucher.voucherCode, recipient, userName, voucherNote);
                    message += " E-mail został wysłany.";
                } catch (notifErr) {
                    console.error("Błąd przy wysyłaniu wiadomości:", notifErr);
                    message += " Nie udało się wysłać e-maila.";
                }
            }
            setAlertMessage(message);
            resetAddForm();
        } catch (err) {
            console.error("Błąd przy dodawaniu vouchera:", err);
            setAddError("Nie udało się dodać vouchera. Spróbuj ponownie.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;

        setIsSearching(true);
        setSearchError("");
        setHasSearched(true);
        try {
            const byId = /^\d+$/.test(term);
            const { data } = byId
                ? await getVoucherById(Number(term))
                : await getVoucherByCode(term);

            const list: Voucher[] = Array.isArray(data) ? data : data ? [data] : [];
            setResults(list);
            setRedemptionInputs({});
            if (list.length === 0) {
                setSearchError("Nie znaleziono vouchera dla podanego kryterium.");
            }
        } catch (err) {
            console.error("Błąd podczas wyszukiwania:", err);
            const status =
                typeof err === "object" && err !== null && "response" in err
                    ? (err as { response?: { status?: number } }).response?.status
                    : undefined;
            setResults([]);
            setSearchError(
                status === 404
                    ? "Nie znaleziono vouchera dla podanego kryterium."
                    : "Wystąpił błąd podczas wyszukiwania."
            );
        } finally {
            setIsSearching(false);
        }
    };

    const handleRedemptionChange = (id: number, value: string) => {
        setRedemptionInputs((prev) => ({ ...prev, [id]: value }));
    };

    const handleRedeem = async (voucher: Voucher) => {
        setSearchError("");
        const value = Number(redemptionInputs[voucher.id]);

        if (!Number.isFinite(value) || value <= 0) {
            setSearchError("Kwota realizacji musi być większa od zera.");
            return;
        }
        if (value > voucher.availableAmount) {
            setSearchError(
                `Kwota realizacji nie może przekraczać pozostałych ${formatCurrency(
                    voucher.availableAmount
                )}.`
            );
            return;
        }
        if (
            isExpired(voucher.validUntil) &&
            !window.confirm("Voucher jest przedawniony. Czy na pewno chcesz go zrealizować?")
        ) {
            return;
        }

        setRedeemingId(voucher.id);
        try {
            const { data: updated } = await realizeVoucher(voucher.voucherCode, value);
            setResults((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
            setRedemptionInputs((prev) => ({ ...prev, [voucher.id]: "" }));
            setAlertMessage(
                updated.availableAmount > 0
                    ? `Zrealizowano ${formatCurrency(value)}. Pozostało ${formatCurrency(
                          updated.availableAmount
                      )}.`
                    : "Voucher został w całości zrealizowany."
            );
        } catch (err) {
            console.error("Błąd przy realizacji vouchera:", err);
            setSearchError("Wystąpił błąd podczas realizacji vouchera.");
        } finally {
            setRedeemingId(null);
        }
    };

    return (
        <div className="ar-page">
            <header className="ar-header">
                <h1>Vouchery</h1>
                <p>Dodaj nowy voucher lub zrealizuj istniejący.</p>
            </header>

            <div className="ar-tabs" role="tablist" aria-label="Operacje na voucherach">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "add"}
                    className={`ar-tab ${activeTab === "add" ? "is-active" : ""}`}
                    onClick={() => setActiveTab("add")}
                >
                    Dodaj
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "realize"}
                    className={`ar-tab ${activeTab === "realize" ? "is-active" : ""}`}
                    onClick={() => setActiveTab("realize")}
                >
                    Realizuj
                </button>
            </div>

            {activeTab === "add" && (
                <section className="ar-card" aria-label="Dodawanie vouchera">
                    <form className="ar-form" onSubmit={handleAdd} noValidate>
                        <div className="ar-field">
                            <label htmlFor="ar-payment">Metoda płatności</label>
                            <select
                                id="ar-payment"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required
                            >
                                <option value="">Wybierz metodę</option>
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="ar-field">
                            <label htmlFor="ar-amount">Kwota (zł)</label>
                            <input
                                id="ar-amount"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="np. 200"
                                required
                            />
                        </div>

                        <div className="ar-field">
                            <label htmlFor="ar-place">Miejsce</label>
                            <select
                                id="ar-place"
                                value={place}
                                onChange={(e) => setPlace(e.target.value)}
                                required
                            >
                                <option value="">Wybierz miejsce</option>
                                {PLACES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="ar-field">
                            <label htmlFor="ar-days">Ważność (dni)</label>
                            <input
                                id="ar-days"
                                type="number"
                                inputMode="numeric"
                                min="1"
                                step="1"
                                value={daysValid}
                                onChange={(e) => setDaysValid(e.target.value)}
                                placeholder={String(DEFAULT_DAYS)}
                            />
                        </div>

                        <div className="ar-field ar-field--full">
                            <label htmlFor="ar-note">Notatka</label>
                            <input
                                id="ar-note"
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Krótka notatka wewnętrzna"
                                required
                            />
                        </div>

                        <div className="ar-divider ar-field--full">
                            <span>Wysyłka e-mail (opcjonalnie)</span>
                        </div>

                        <div className="ar-field">
                            <label htmlFor="ar-email">E-mail klienta</label>
                            <input
                                id="ar-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="adres@email.pl"
                            />
                        </div>

                        <div className="ar-field">
                            <label htmlFor="ar-username">Dla kogo</label>
                            <input
                                id="ar-username"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Imię obdarowanej osoby"
                            />
                        </div>

                        <div className="ar-field ar-field--full">
                            <label htmlFor="ar-vouchernote">Informacja na voucherze</label>
                            <input
                                id="ar-vouchernote"
                                type="text"
                                value={voucherNote}
                                onChange={(e) => setVoucherNote(e.target.value)}
                                placeholder="Treść widoczna na voucherze (np. rodzaj usługi)"
                            />
                        </div>

                        {addError && (
                            <p className="ar-message ar-message--error ar-field--full" role="alert">
                                {addError}
                            </p>
                        )}

                        <div className="ar-actions ar-field--full">
                            <button
                                type="submit"
                                className="ar-btn ar-btn--primary"
                                disabled={isAdding}
                            >
                                {isAdding ? <span className="ar-spinner" aria-hidden /> : null}
                                {isAdding ? "Dodawanie…" : "Dodaj voucher"}
                            </button>
                        </div>
                    </form>

                    {lastAdded && (
                        <div className="ar-receipt" role="status">
                            <div className="ar-receipt__head">
                                <span className="ar-badge ar-badge--success">Dodano</span>
                                <code className="ar-code">{lastAdded.voucherCode}</code>
                            </div>
                            <dl className="ar-receipt__grid">
                                <div>
                                    <dt>Kwota</dt>
                                    <dd>{formatCurrency(lastAdded.amount)}</dd>
                                </div>
                                <div>
                                    <dt>Miejsce</dt>
                                    <dd>{lastAdded.place || "—"}</dd>
                                </div>
                                <div>
                                    <dt>Ważny do</dt>
                                    <dd>{formatDate(lastAdded.validUntil)}</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </section>
            )}

            {activeTab === "realize" && (
                <section className="ar-card" aria-label="Realizacja vouchera">
                    <form className="ar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Wpisz ID lub kod vouchera"
                            aria-label="ID lub kod vouchera"
                        />
                        <button
                            type="submit"
                            className="ar-btn ar-btn--primary"
                            disabled={isSearching || !searchTerm.trim()}
                        >
                            {isSearching ? <span className="ar-spinner" aria-hidden /> : null}
                            {isSearching ? "Szukam…" : "Szukaj"}
                        </button>
                    </form>

                    {searchError && (
                        <p className="ar-message ar-message--error" role="alert">
                            {searchError}
                        </p>
                    )}

                    {!searchError && hasSearched && !isSearching && results.length === 0 && (
                        <p className="ar-empty">Brak wyników.</p>
                    )}

                    <div className="ar-results">
                        {results.map((voucher) => {
                            const realized = isVoucherRealized(voucher);
                            const expired = isExpired(voucher.validUntil);
                            const busy = redeemingId === voucher.id;

                            return (
                                <article key={voucher.id} className="ar-voucher">
                                    <div className="ar-voucher__head">
                                        <code className="ar-code">{voucher.voucherCode}</code>
                                        {realized ? (
                                            <span className="ar-badge ar-badge--muted">Zrealizowany</span>
                                        ) : expired ? (
                                            <span className="ar-badge ar-badge--warn">Przedawniony</span>
                                        ) : (
                                            <span className="ar-badge ar-badge--success">Aktywny</span>
                                        )}
                                    </div>

                                    <dl className="ar-voucher__grid">
                                        <div>
                                            <dt>Pozostała kwota</dt>
                                            <dd className="ar-strong">
                                                {formatCurrency(voucher.availableAmount)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Kwota początkowa</dt>
                                            <dd>{formatCurrency(voucher.amount)}</dd>
                                        </div>
                                        <div>
                                            <dt>Miejsce</dt>
                                            <dd>{voucher.place || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt>Metoda płatności</dt>
                                            <dd>{voucher.paymentMethod}</dd>
                                        </div>
                                        <div>
                                            <dt>Data sprzedaży</dt>
                                            <dd>{formatDate(voucher.saleDate)}</dd>
                                        </div>
                                        <div>
                                            <dt>Ważny do</dt>
                                            <dd>{formatDate(voucher.validUntil)}</dd>
                                        </div>
                                        {voucher.note && (
                                            <div className="ar-voucher__note">
                                                <dt>Notatka</dt>
                                                <dd>{voucher.note}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    {realized ? (
                                        <p className="ar-voucher__done">
                                            Voucher został w całości zrealizowany.
                                        </p>
                                    ) : (
                                        <div className="ar-voucher__redeem">
                                            <div className="ar-field">
                                                <label htmlFor={`ar-redeem-${voucher.id}`}>
                                                    Kwota do realizacji (zł)
                                                </label>
                                                <input
                                                    id={`ar-redeem-${voucher.id}`}
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    step="0.01"
                                                    max={voucher.availableAmount}
                                                    value={redemptionInputs[voucher.id] ?? ""}
                                                    onChange={(e) =>
                                                        handleRedemptionChange(voucher.id, e.target.value)
                                                    }
                                                    placeholder="np. 50"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="ar-btn ar-btn--primary"
                                                onClick={() => handleRedeem(voucher)}
                                                disabled={busy}
                                            >
                                                {busy ? <span className="ar-spinner" aria-hidden /> : null}
                                                {busy ? "Realizuję…" : "Zrealizuj"}
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {alertMessage && (
                <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
        </div>
    );
};

export default AddRealizeVoucher;

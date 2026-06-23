import React, { useEffect, useMemo, useState } from "react";
import { getNotifications } from "../../services/notificationService.ts";
import VoucherSort from "../VoucherSort/VoucherSort";
import TablePager from "../TablePager/TablePager";
import { ColumnType, PAGE_SIZES, SortDirection, compareByType } from "../../utils/table.ts";
// Reużywamy stylu tabeli z listy voucherów (klasy vl-*), aby wygląd był identyczny.
import "../voucherList/VoucherList.css";

interface Notification {
    id: number;
    voucherCode: string;
    sendDateTime: string;
    email: string;
    status: string;
    note: string;
}

const COLUMNS: { key: keyof Notification; label: string; type: ColumnType }[] = [
    { key: "id", label: "ID", type: "number" },
    { key: "voucherCode", label: "Kod vouchera", type: "text" },
    { key: "sendDateTime", label: "Data wysłania", type: "date" },
    { key: "email", label: "Email", type: "text" },
    { key: "status", label: "Status", type: "text" },
    { key: "note", label: "Notatka", type: "text" },
];

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pl-PL");
};

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [sortColumn, setSortColumn] = useState<keyof Notification>("id");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(100);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getNotifications();
                setNotifications(response.data);
                setError(null);
            } catch (err) {
                setError("Nie udało się pobrać listy wysłanych voucherów.");
                console.error("Błąd:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const columnType = useMemo(
        () => new Map(COLUMNS.map((c) => [c.key, c.type])),
        []
    );

    const sortedNotifications = useMemo(() => {
        const type = columnType.get(sortColumn) ?? "text";
        return [...notifications].sort((a, b) =>
            compareByType(a[sortColumn], b[sortColumn], type, sortDirection)
        );
    }, [notifications, sortColumn, sortDirection, columnType]);

    const totalPages = Math.max(1, Math.ceil(sortedNotifications.length / pageSize));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const currentNotifications = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedNotifications.slice(start, start + pageSize);
    }, [sortedNotifications, currentPage, pageSize]);

    const handleSort = (column: string) => {
        const key = column as keyof Notification;
        setSortDirection((prevDir) =>
            sortColumn === key ? (prevDir === "asc" ? "desc" : "asc") : "asc"
        );
        setSortColumn(key);
        setCurrentPage(1);
    };

    return (
        <div className="vl-page">
            <header className="vl-header">
                <h1>Wysłane vouchery</h1>
                <p>{loading ? "Ładowanie…" : `Znaleziono ${notifications.length} wysłanych voucherów`}</p>
            </header>

            <div className="vl-card">
                {error && (
                    <p className="vl-message vl-message--error" role="alert">{error}</p>
                )}

                <div className="vl-table-wrap">
                    <table className="vl-table">
                        <thead>
                        <tr>
                            {COLUMNS.map(({ key, label }) => (
                                <VoucherSort
                                    key={key}
                                    column={key}
                                    label={label}
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="vl-state">Ładowanie danych…</td>
                            </tr>
                        ) : currentNotifications.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="vl-state">Brak wysłanych voucherów.</td>
                            </tr>
                        ) : (
                            currentNotifications.map((notification) => (
                                <tr key={notification.id} className="vl-row">
                                    <td>{notification.id}</td>
                                    <td className="vl-code">{notification.voucherCode}</td>
                                    <td>{formatDateTime(notification.sendDateTime)}</td>
                                    <td>{notification.email}</td>
                                    <td>{notification.status}</td>
                                    <td className="vl-note">{notification.note}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <TablePager
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizes={PAGE_SIZES}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
};

export default NotificationList;

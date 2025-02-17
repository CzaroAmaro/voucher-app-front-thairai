import React, {useEffect, useState} from 'react';
import {getNotifications} from "../../services/notificationService.ts";
import "./NotificationList.css"

interface Notification {
    id: number;
    voucherCode: string;
    sendDateTime: string;
    email: string;
    status: string;
    note: string;
}

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getNotifications();
                setNotifications(response.data);
                setError(null);
            } catch (err) {
                setError("Nie udało się pobrać listy wysłanych voucherów");
                console.error("Błąd:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) return <p>Ładowanie danych...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="sent-vouchers-container">
            <h2 className="heading">Wysłane Vouchery</h2>
            <div className="table-wrapper">
                <table className="table-container">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Kod vouchera</th>
                        <th>Data wysłania</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Notatka</th>
                    </tr>
                    </thead>
                    <tbody>
                    {notifications.map((notification) => (
                        <tr key={notification.id}>
                            <td>{notification.id}</td>
                            <td>{notification.voucherCode}</td>
                            <td>{new Date(notification.sendDateTime).toLocaleString()}</td>
                            <td>{notification.email}</td>
                            <td>{notification.status}</td>
                            <td>{notification.note}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NotificationList;
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VoucherList from "./components/voucherList/VoucherList.tsx";
import Navbar from "./components/navbar/Navbar.tsx";
import DeletedVoucher from "./components/DeletedVoucher/DeletedVoucher.tsx";
import NotificationList from "./components/NotificationList/NotificationList.tsx";
import Reports from "./components/Reports/Reports.tsx";
import Login from "./components/Login/Login.tsx";
import "./App.css";
import AddRealizeVoucher from "./components/AddRealizeVoucher/AddRealizeVoucher.tsx";
import VoucherDateRange from "./components/VoucherDateRange/VoucherDateRange.tsx";

const App: React.FC = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    useEffect(() => {
        const theme = darkMode ? "dark" : "light";
        localStorage.setItem("theme", theme);
    }, [darkMode]);

    return (
        <BrowserRouter>
            <div className="app-container" data-theme={darkMode ? "dark" : "light"}>
                <aside className="sidebar">
                    <Navbar
                        toggleDarkMode={toggleDarkMode}
                        darkMode={darkMode}
                        isLoggedIn={isLoggedIn}
                        onLogout={() => setIsLoggedIn(false)}
                    />
                </aside>
                <main className="main-content">
                    <Routes>
                        <Route path="/add-realize" element={<AddRealizeVoucher/>} />
                        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />

                        {isLoggedIn ? (
                            <>
                                <Route path="/" element={<VoucherList />} />
                                <Route path="/add" element={<AddRealizeVoucher />} />
                                <Route path="/deleted" element={<DeletedVoucher />} />
                                <Route path="/sent" element={<NotificationList />} />
                                <Route path="/report" element={<Reports />} />
                                <Route path="/date-range" element={<VoucherDateRange />} />
                            </>
                        ) : (
                            <Route path="/" element={<Navigate to="/add-realize" replace />} />
                        )}
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;

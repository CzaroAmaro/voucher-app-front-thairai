import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VoucherList from "./components/voucherList/VoucherList.tsx";
import Navbar from "./components/navbar/Navbar.tsx";
import AddVoucher from "./components/AddVoucher/AddVoucher.tsx";
import DeletedVoucher from "./components/DeletedVoucher/DeletedVoucher.tsx";
import NotificationList from "./components/NotificationList/NotificationList.tsx";
import ReportGenerator from "./components/ReportGenerator/ReportGenerator.tsx";
import ReportListGenerator from "./components/ReportListGenerator/ReportListGenerator.tsx";
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
                    <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} isLoggedIn={isLoggedIn} />
                </aside>
                <main className="main-content">
                    <Routes>
                        <Route path="/add-realize" element={<AddRealizeVoucher/>} />
                        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />

                        {isLoggedIn && (
                            <>
                                <Route path="/" element={<VoucherList />} />
                                <Route path="/add" element={<AddVoucher />} />
                                <Route path="/deleted" element={<DeletedVoucher />} />
                                <Route path="/sent" element={<NotificationList />} />
                                <Route path="/report" element={<ReportGenerator />} />
                                <Route path="/custom-report" element={<ReportListGenerator />} />
                                <Route path="/date-range" element={<VoucherDateRange />} />
                            </>
                        )}
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;

import React, {useState, useEffect} from "react";
import VoucherList from "./components/voucherList/VoucherList.tsx";
import Navbar from "./components/navbar/Navbar.tsx";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import AddVoucher from "./components/AddVoucher/AddVoucher.tsx";
import DeletedVoucher from "./components/DeletedVoucher/DeletedVoucher.tsx";
import NotificationList from "./components/NotificationList/NotificationList.tsx";
import ReportGenerator from "./components/ReportGenerator/ReportGenerator.tsx";

const App: React.FC = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark'
    );
    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    useEffect(() => {
        const theme=darkMode? "dark" : "light";
        localStorage.setItem("theme", theme);
    },[darkMode]);
    return (
        <BrowserRouter>
            <div className="app-container" data-theme={darkMode? "dark" : "light"}>
                <aside className="sidebar">
                    <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
                </aside>
                <main className="main-content" dark-theme="dark">
                    <Routes>
                        <Route path="/" element={<VoucherList />} />
                        <Route path="/add" element={<AddVoucher />} />
                        <Route path="/deleted" element={<DeletedVoucher />} />
                        <Route path="/sent" element={<NotificationList />} />
                        <Route path="/report" element={<ReportGenerator />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
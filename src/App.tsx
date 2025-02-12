import React, {useState, useEffect} from "react";
import VoucherList from "./components/voucherList/VoucherList.tsx";
import Navbar from "./components/navbar/Navbar.tsx";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import AddVoucher from "./components/AddVoucher/AddVoucher.tsx";

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
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
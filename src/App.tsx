import React from "react";
import VoucherList from "./components/voucherList/VoucherList.tsx";
import Navbar from "./components/navbar/Navbar.tsx";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <div className="app-container" dark-theme="dark">
                <aside className="sidebar">
                    <Navbar />
                </aside>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<VoucherList />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
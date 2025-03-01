import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
    toggleDarkMode: () => void;
    darkMode: boolean;
    isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode, darkMode, isLoggedIn }) => {
    return (
        <nav className="navbar">
            <h1>Voucher app</h1>
            <ul>
                {!isLoggedIn && (
                    <>
                        <li>
                            <Link to="/add-realize">✚ Dodaj i Realizuj</Link>
                        </li>
                        <li>
                            <Link to="/login">
                                <button className="hidden-login-button" aria-label="Logowanie">
                                    Logowanie
                                </button>
                            </Link>
                        </li>
                    </>
                )}
                {isLoggedIn && (
                    <>
                        <li>
                            <Link to="/">🏠︎ Home</Link>
                        </li>
                        <li>
                            <Link to="/add">✚ Dodaj</Link>
                        </li>
                        <li>
                            <Link to="/deleted">🗑 Usunięte</Link>
                        </li>
                        <li>
                            <Link to="/sent">✉ Wysłane</Link>
                        </li>
                        <li>
                            <Link to="/report">🗐 Generuj raport</Link>
                        </li>
                        <li>
                            <Link to="/custom-report">🗐 Własny raport</Link>
                        </li>
                    </>
                )}
            </ul>
            <label className="theme-switch">
            <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                /> Dark Mode
                <span className="slider"></span>
            </label>
        </nav>
    );
};

export default Navbar;

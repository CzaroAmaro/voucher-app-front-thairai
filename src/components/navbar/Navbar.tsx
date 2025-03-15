import React, {useState} from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
    toggleDarkMode: () => void;
    darkMode: boolean;
    isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode, darkMode, isLoggedIn }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="toggle-button"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? '→' : '←'}
            </button>

            <h1>Voucher App</h1>
            <ul>
                {!isLoggedIn && (
                    <>
                        <li>
                            <NavLink to="/add-realize" className={({isActive}) => isActive ? 'active' : ''}>
                                ✚ <span className="link-text">Dodaj i Realizuj</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/login">
                                <button className="hidden-login-button" aria-label="Logowanie">
                                    Logowanie
                                </button>
                            </NavLink>
                        </li>
                    </>
                )}
                {isLoggedIn && (
                    <>
                        <li>
                            <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
                                🏠︎ <span className="link-text">Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/add" className={({isActive}) => isActive ? 'active' : ''}>
                                ✚ <span className="link-text">Dodaj</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/deleted" className={({isActive}) => isActive ? 'active' : ''}>
                                🗑 <span className="link-text">Usunięte</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/sent" className={({isActive}) => isActive ? 'active' : ''}>
                                ✉︎ <span className="link-text">Wysłane</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/report" className={({isActive}) => isActive ? 'active' : ''}>
                                🗐 <span className="link-text">Generuj raport</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/custom-report" className={({isActive}) => isActive ? 'active' : ''}>
                                🗐 <span className="link-text">Własny raport</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/date-range" className={({isActive}) => isActive ? 'active' : ''}>
                                🗐 <span className="link-text">Przegląd</span>
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
            <label className="theme-switch">
                <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                />
                <span className="slider"></span>
                <span className="theme-text">Dark Mode</span>
            </label>
        </nav>
    );
};

export default Navbar;

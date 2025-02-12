import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
    toggleDarkMode: () => void;
    darkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({toggleDarkMode, darkMode}) => {
    return (
        <nav className="navbar">
            <h1>Voucher App</h1>
            <ul>
                <li>
                    <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
                        Lista Voucherów
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/add" className={({isActive}) => isActive ? 'active' : ''}>
                        Dodaj Voucher
                    </NavLink>
                </li>
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
import React, {useEffect, useState} from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <h1>Voucher App</h1>
            <ul>
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                        Lista Voucherów
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
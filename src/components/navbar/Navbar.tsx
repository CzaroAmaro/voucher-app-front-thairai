import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
    toggleDarkMode: () => void;
    darkMode: boolean;
    isLoggedIn: boolean;
    onLogout: () => void;
}

interface NavItem {
    to: string;
    label: string;
    icon: React.ReactNode;
    end?: boolean;
}

/* --- Ikony (inline SVG, dziedziczą kolor przez currentColor) --- */
const iconProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

const IconPlusCircle = () => (
    <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
);
const IconHome = () => (
    <svg {...iconProps}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
);
const IconPlus = () => (
    <svg {...iconProps}><path d="M12 5v14M5 12h14" /></svg>
);
const IconTrash = () => (
    <svg {...iconProps}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></svg>
);
const IconMail = () => (
    <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
const IconReport = () => (
    <svg {...iconProps}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></svg>
);
const IconCalendar = () => (
    <svg {...iconProps}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
const IconSun = () => (
    <svg {...iconProps} width={18} height={18}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></svg>
);
const IconMoon = () => (
    <svg {...iconProps} width={18} height={18}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>
);
const IconLogout = () => (
    <svg {...iconProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);

const PUBLIC_LINKS: NavItem[] = [
    { to: "/add-realize", label: "Dodaj i Realizuj", icon: <IconPlusCircle /> },
];

const PRIVATE_LINKS: NavItem[] = [
    { to: "/", label: "Home", icon: <IconHome />, end: true },
    { to: "/add", label: "Dodaj", icon: <IconPlus /> },
    { to: "/deleted", label: "Usunięte", icon: <IconTrash /> },
    { to: "/sent", label: "Wysłane", icon: <IconMail /> },
    { to: "/report", label: "Raporty", icon: <IconReport /> },
    { to: "/date-range", label: "Przegląd", icon: <IconCalendar /> },
];

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode, darkMode, isLoggedIn, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const links = isLoggedIn ? PRIVATE_LINKS : PUBLIC_LINKS;

    const handleLogout = () => {
        onLogout();
        navigate("/add-realize");
    };

    const renderLink = ({ to, label, icon, end }: NavItem) => (
        <li key={to}>
            <NavLink
                to={to}
                end={end}
                title={label}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            >
                <span className="nav-link__icon" aria-hidden>{icon}</span>
                <span className="nav-link__text">{label}</span>
            </NavLink>
        </li>
    );

    return (
        <nav className={`navbar ${isCollapsed ? "collapsed" : ""}`} aria-label="Menu główne">
            <div className="nav-header">
                <div className="nav-brand">
                    <span className="nav-brand__mark" aria-hidden>V</span>
                    <span className="nav-brand__text">Voucher App</span>
                </div>
                <button
                    type="button"
                    className="nav-collapse"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    aria-label={isCollapsed ? "Rozwiń menu" : "Zwiń menu"}
                    aria-expanded={!isCollapsed}
                >
                    <svg {...iconProps} width={18} height={18}>
                        {isCollapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
                    </svg>
                </button>
            </div>

            <ul className="nav-links">
                {links.map(renderLink)}
                {!isLoggedIn && (
                    <li>
                       
                    </li>
                )}
            </ul>

            <button
                type="button"
                className="nav-theme"
                onClick={toggleDarkMode}
                role="switch"
                aria-checked={darkMode}
                title={darkMode ? "Wyłącz tryb ciemny" : "Włącz tryb ciemny"}
            >
                <span className="nav-theme__track">
                    <span className="nav-theme__thumb">{darkMode ? <IconMoon /> : <IconSun />}</span>
                </span>
                <span className="nav-link__text">{darkMode ? "Tryb ciemny" : "Tryb jasny"}</span>
            </button>

            {isLoggedIn && (
                <button
                    type="button"
                    className="nav-logout"
                    onClick={handleLogout}
                    title="Wyloguj"
                >
                    <span className="nav-link__icon" aria-hidden><IconLogout /></span>
                    <span className="nav-link__text">Wyloguj</span>
                </button>
            )}
        </nav>
    );
};

export default Navbar;

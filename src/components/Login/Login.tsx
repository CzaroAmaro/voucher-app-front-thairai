import React, { useState } from "react";
import "./Login.css";

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "irys") {
            onLogin();
            setLoginError("");
        } else {
            setLoginError("Niepoprawne hasło.");
        }
    };

    return (
        <div className="login-form-container">
            <h2>Logowanie</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wpisz hasło"
                />
                <button type="submit">Zaloguj</button>
                {loginError && <p className="error">{loginError}</p>}
            </form>
        </div>
    );
};

export default Login;

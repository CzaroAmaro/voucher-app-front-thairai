import React from "react";
import "./Alert.css";

interface AlertProps {
    message: string;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
    return (
        <div className="alert-overlay">
            <div className="alert-box">
                <div className="alert-message">{message}</div>
                <button className="alert-close-button" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default Alert;
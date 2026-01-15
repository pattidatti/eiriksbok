import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LinkButtonProps {
    to: string;
    text: string;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const LinkButton: React.FC<LinkButtonProps> = ({ to, text, variant = 'primary' }) => {
    const navigate = useNavigate();

    const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center gap-2 w-fit mx-auto my-6";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30",
        secondary: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30",
        outline: "border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50"
    };

    return (
        <button
            onClick={() => navigate(to)}
            className={`${baseStyles} ${variants[variant]}`}
        >
            <span className="text-lg">➜</span>
            {text}
        </button>
    );
};

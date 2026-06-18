import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => { 
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('usuario_sesion');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('usuario_sesion', JSON.stringify(user));
        } else {
            localStorage.removeItem('usuario_sesion');
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData); // Guardará: { id, username, rol }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
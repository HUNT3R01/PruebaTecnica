import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    // Si el usuario no existe (no está logueado), lo mandamos al login
    return user ? children : <Navigate to="/login" />;
};

function App() {
    const { user } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta Pública: Login */}
                <Route 
                    path="/login" 
                    element={user ? <Navigate to="/dashboard" /> : <Login />} 
                />

                {/* Ruta Protegida: Dashboard de Tareas */}
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />

                {/* Redirección por defecto si escriben cualquier otra ruta */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
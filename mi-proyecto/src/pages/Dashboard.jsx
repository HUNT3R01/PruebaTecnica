import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [tareas, setTareas] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTareas = async () => {
            try {
                // Le pasamos el ID y Rol del usuario logueado en la URL para aplicar la lógica de roles del backend
                const response = await fetch(`http://localhost:5000/api/tareas?usuarioId=${user.id}&rol=${user.rol}`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || 'Error al obtener tareas');
                
                setTareas(data);
                
                // Opcional para cumplir el PDF: guardamos un respaldo espejo en localStorage
                localStorage.setItem('respaldo_tareas', JSON.stringify(data));
            } catch (err) {
                setError(err.message);
                // Si el backend falla, recuperamos del localStorage como plan de contingencia
                const respaldadas = localStorage.getItem('respaldo_tareas');
                if (respaldadas) setTareas(JSON.parse(respaldadas));
            }
        };

        if (user) fetchTareas();
    }, [user]);

    // Función para validar visualmente si una tarea está vencida y pendiente
    const esTareaVencida = (fechaVencimiento, estado) => {
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const vencimiento = new Date(fechaVencimiento);
        return vencimiento < hoy && estado === 'Pendiente';
    };

    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <div>
                    <h1>Panel de Tareas</h1>
                    <p>Bienvenido, <strong>{user.username}</strong> ({user.rol})</p>
                </div>
                <button onClick={logout} style={styles.logoutBtn}>Cerrar Sesión</button>
            </header>

            {error && <p style={styles.error}>{error}</p>}

            <main style={styles.lista}>
                {tareas.length === 0 ? (
                    <p>No hay tareas asignadas.</p>
                ) : (
                    tareas.map((tarea) => {
                        const vencida = esTareaVencida(tarea.fecha_vencimiento, tarea.estado);
                        
                        return (
                            <div 
                                key={tarea.id} 
                                style={{
                                    ...styles.card,
                                    // Cambia dinámicamente el estilo si está vencida
                                    backgroundColor: vencida ? '#ffe6e6' : '#fff',
                                    borderLeft: vencida ? '6px solid #dc3545' : '6px solid #28a745'
                                }}
                            >
                                <h3>{tarea.titulo}</h3>
                                <p><strong>Estado:</strong> {tarea.estado}</p>
                                <p>
                                    <strong>Vencimiento:</strong> {new Date(tarea.fecha_vencimiento).toLocaleDateString()}
                                    {vencida && <span style={styles.alertaVencido}> ¡RETRASADA!</span>}
                                </p>
                                {user.rol === 'Administrador' && (
                                    <p style={styles.badgeAdmin}>ID Usuario Asignado: {tarea.usuario_id}</p>
                                )}
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
};

const styles = {
    dashboard: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' },
    logoutBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    lista: { display: 'grid', gap: '1rem' },
    card: { padding: '1rem', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.3s' },
    alertaVencido: { color: '#dc3545', fontWeight: 'bold', marginLeft: '0.5rem' },
    badgeAdmin: { fontSize: '0.8rem', color: '#555', fontStyle: 'italic', marginTop: '0.5rem' },
    error: { color: 'red' }
};

export default Dashboard;
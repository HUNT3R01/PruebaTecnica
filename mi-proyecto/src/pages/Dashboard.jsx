import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [tareas, setTareas] = useState([]);
    const [error, setError] = useState('');
    const [titulo, setTitulo] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    const fetchTareas = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tareas?usuarioId=${user.id}&rol=${user.rol}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al obtener tareas');
            
            setTareas(data);
            localStorage.setItem('respaldo_tareas', JSON.stringify(data));
        } catch (err) {
            setError(err.message);
            const respaldadas = localStorage.getItem('respaldo_tareas');
            if (respaldadas) setTareas(JSON.parse(respaldadas));
        }
    };

    useEffect(() => {
        if (user) fetchTareas();
    }, [user]);

    useEffect(() => {
        const manejarEventoLogout = (e) => {
            console.log("Custom Event capturado con éxito:", e.detail.mensaje);
        };

        window.addEventListener('usuarioLogout', manejarEventoLogout);

        return () => {
            window.removeEventListener('usuarioLogout', manejarEventoLogout);
        };
    }, []);

    const handleCrearTarea = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeExito('');

        try {
            const response = await fetch('http://localhost:5000/api/tareas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo,
                    fecha_vencimiento: fechaVencimiento,
                    usuario_id: user.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear la tarea');
            }

            setTitulo('');
            setFechaVencimiento('');
            setMensajeExito('¡Tarea creada con éxito!');
            fetchTareas();
        } catch (err) {
            setError(err.message);
        }
    };

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
                    <h1 style={styles.mainTitle}>Panel de Tareas</h1>
                    <p style={styles.welcomeText}>Bienvenido, <span style={styles.username}>{user?.username}</span> <span style={styles.roleBadge}>{user?.rol}</span></p>
                </div>
                <button onClick={logout} style={styles.logoutBtn}>Cerrar Sesión</button>
            </header>

            <section style={styles.formSection}>
                <h3 style={styles.sectionTitle}>Crear Nueva Tarea</h3>
                {mensajeExito && <p style={styles.exito}>{mensajeExito}</p>}
                
                <form onSubmit={handleCrearTarea} style={styles.formInline}>
                    <input 
                        type="text" 
                        placeholder="Título de la tarea..." 
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required 
                        style={styles.input}
                    />
                    <input 
                        type="date" 
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        required 
                        style={styles.inputDate}
                    />
                    <button type="submit" style={styles.submitBtn}>Añadir</button>
                </form>
            </section>

            {error && <p style={styles.error}>{error}</p>}

            <main style={styles.lista}>
                {tareas.length === 0 ? (
                    <p style={styles.noTareas}>No hay tareas asignadas actualmente.</p>
                ) : (
                    tareas.map((tarea) => {
                        const vencida = esTareaVencida(tarea.fecha_vencimiento, tarea.estado);
                        
                        return (
                            <div 
                                key={tarea.id} 
                                style={{
                                    ...styles.card,
                                    backgroundColor: vencida ? '#fff5f5' : '#ffffff',
                                    borderLeft: vencida ? '5px solid #e53e3e' : '5px solid #319795',
                                    boxShadow: vencida ? '0 2px 8px rgba(229,62,62,0.05)' : '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>{tarea.titulo}</h3>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: vencida ? '#fed7d7' : '#e6fffa',
                                        color: vencida ? '#c53030' : '#234e52'
                                    }}>
                                        {tarea.estado}
                                    </span>
                                </div>
                                <p style={styles.cardDate}>
                                    <strong>Vencimiento:</strong> {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                                    {vencida && <span style={styles.alertaVencido}> ¡RETRASADA!</span>}
                                </p>
                                {user?.rol === 'Administrador' && (
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
    dashboard: { padding: '2.5rem 1.5rem', maxWidth: '750px', margin: '0 auto', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' },
    mainTitle: { margin: 0, fontSize: '2rem', color: '#111', fontWeight: '700' },
    welcomeText: { margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.95rem' },
    username: { fontWeight: '600', color: '#111' },
    roleBadge: { backgroundColor: '#e2e8f0', color: '#4a5568', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', marginLeft: '0.5rem' },
    logoutBtn: { backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #fed7d7', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
    formSection: { backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' },
    sectionTitle: { margin: '0 0 1rem 0', color: '#2d3748', fontSize: '1.2rem', fontWeight: '600' },
    formInline: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    input: { padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 2, minWidth: '200px', fontSize: '0.95rem', outline: 'none' },
    inputDate: { padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 1, minWidth: '150px', fontSize: '0.95rem', outline: 'none', color: '#4a5568' },
    submitBtn: { backgroundColor: '#319795', color: '#ffffff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
    lista: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    card: { padding: '1.25rem', borderRadius: '8px', border: '1px solid #f0f0f0' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    cardTitle: { margin: 0, fontSize: '1.15rem', color: '#1a202c', fontWeight: '600' },
    statusBadge: { padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
    cardDate: { margin: 0, fontSize: '0.9rem', color: '#4a5568' },
    alertaVencido: { color: '#e53e3e', fontWeight: '700', marginLeft: '0.5rem', fontSize: '0.85rem' },
    badgeAdmin: { fontSize: '0.8rem', color: '#718096', fontStyle: 'italic', marginTop: '0.75rem', borderTop: '1px dashed #edf2f7', paddingTop: '0.5rem', margin: '0.75rem 0 0 0' },
    noTareas: { textAlign: 'center', color: '#718096', marginTop: '2rem' },
    error: { color: '#c53030', backgroundColor: '#fed7d7', padding: '0.75rem', borderRadius: '6px', marginTop: '1rem', border: '1px solid #feb2b2', fontSize: '0.9rem' },
    exito: { color: '#22543d', backgroundColor: '#c6f6d5', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem', border: '1px solid #9ae6b4', fontWeight: '500' }
};

export default Dashboard;
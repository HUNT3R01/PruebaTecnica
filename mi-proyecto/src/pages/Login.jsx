import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            login(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Iniciar Sesión</h2>
                {error && <p style={styles.error}>{error}</p>}
                
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Usuario</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Contraseña</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={styles.input}
                    />
                </div>

                <button type="submit" style={styles.button}>Ingresar</button>
            </form>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    form: { padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', width: '340px', boxSizing: 'border-box' },
    title: { margin: '0 0 1.5rem 0', color: '#1a1a1a', textAlign: 'center', fontSize: '1.75rem', fontWeight: '600' },
    inputGroup: { marginBottom: '1.25rem', display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '0.5rem', color: '#4a4a4a', fontSize: '0.9rem', fontWeight: '500' },
    input: { padding: '0.75rem', borderRadius: '6px', border: '1px solid black', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', backgroundColor: 'black' },
    button: { width: '100%', padding: '0.75rem', backgroundColor: '#0066cc', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', transition: 'background-color 0.2s', marginTop: '0.5rem' },
    error: { color: '#d93025', backgroundColor: '#fce8e6', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1.25rem', textAlign: 'center', border: '1px solid #fad2cf' }
};

export default Login;
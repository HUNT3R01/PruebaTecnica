import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // <-- Asegúrate de tener esta importación
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* El AuthProvider DEBE envolver a App para que el contexto funcione */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
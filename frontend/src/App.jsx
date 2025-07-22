// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import FormularioPedido from "./components/Pedido/FormularioPedido";
import ResumenPedidoWrapper from "./components/Pedido/ResumenPedidoWrapper";
import PantallaCocina from "./components/Cocina/PantallaCocina";
import DashboardMesas from "./components/Mesas/DashboardMesas";
import Login from "./components/Login/Login";
import CierreCaja from "./components/Caja/CierreCaja";
import Reportes from "./components/Reportes/Reportes";
import WeatherWidget from "./components/Weather/WeatherWidget";
import UserManagement from "./components/Users/UserManagement";
import { getCurrentUser, logout, isAdmin } from "./services/authService";
import "./index.css";

// Componente para proteger rutas
function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const user = getCurrentUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function Home() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white w-full">
      {/* iPhone-style header for home */}
      <div className="bg-orange-500 px-2 py-4.5 flex items-center justify-between w-full min-h-[70px]">
        <div className="flex items-center justify-start w-16">
          {/* Información del usuario */}
          <div className="text-xs text-black">
            <div className="font-semibold">{currentUser?.name}</div>
            <div className="text-xs opacity-75">{currentUser?.role === 'admin' ? 'Admin' : 'Mesero'}</div>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-3xl font-bold text-center">
            <span className="text-black">Punto</span>{" "}
            <span className="text-white">Marisco</span>
          </h1>
        </div>
        
        <div className="flex items-center justify-end w-16">
          <button
            onClick={handleLogout}
            className="text-black hover:text-white transition-colors text-sm"
            title="Cerrar Sesión"
          >
            🚪
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-start pt-8 px-4 w-full">
        {/* Widget del clima */}
        <div className="w-full max-w-sm mb-6">
          <WeatherWidget />
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => navigate("/mesas")}
            className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
          >
            Gestión de Mesas
          </button>

          <button
            onClick={() => navigate("/cocina")}
            className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
          >
            Pantalla Cocina
          </button>

          {/* Solo mostrar botón de usuarios para administradores */}
          {isAdmin() && (
            <button
              onClick={() => navigate("/usuarios")}
              className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
            >
              👥 Gestión de Usuarios
            </button>
          )}

          {/* Solo mostrar caja y reportes para administradores */}
          {isAdmin() && (
            <>
              <button
                onClick={() => navigate("/caja")}
                className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
              >
                💰 Cierre de Caja
              </button>

              <button
                onClick={() => navigate("/reportes")}
                className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
              >
                📊 Reportes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la app
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {/* Rutas */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mesas" 
          element={
            <ProtectedRoute>
              <DashboardMesas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pedido/:id" 
          element={
            <ProtectedRoute>
              <FormularioPedido />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resumen/:id" 
          element={
            <ProtectedRoute>
              <ResumenPedidoWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cocina" 
          element={
            <ProtectedRoute>
              <PantallaCocina />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/caja" 
          element={
            <ProtectedRoute>
              <CierreCaja />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reportes" 
          element={
            <ProtectedRoute adminOnly={true}>
              <Reportes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        {/* Redirigir a login si no está autenticado */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

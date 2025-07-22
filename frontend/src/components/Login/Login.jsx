import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import puntomariscoLogo from "../../assets/puntomarisco.jpg";
import WeatherWidget from "../Weather/WeatherWidget";
import { authenticateUser } from "../../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Usar el servicio de autenticación
    setTimeout(() => {
      if (!email || !password) {
        setError("Por favor ingrese email y contraseña");
        setLoading(false);
        return;
      }
      
      const result = authenticateUser(email, password);
      
      if (result.success) {
        navigate("/");
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Fondo con imagen de mariscos */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(${puntomariscoLogo})`,
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Contenedor principal responsivo */}
      <div className="relative z-10 w-full max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Widget del clima */}
        <div className="mb-4 sm:mb-6">
          <WeatherWidget />
        </div>
        
        {/* Formulario de login */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-500/30 p-6 sm:p-8 lg:p-10">
          {/* Logo y título */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <img 
                src={puntomariscoLogo} 
                alt="Punto Marisco" 
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto rounded-full border-4 border-orange-500 object-cover shadow-lg"
              />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">
              PUNTO MARISCO
            </h1>
            <p className="text-orange-300 text-sm sm:text-base">Inicio de Sesión</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-orange-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border-2 border-orange-500/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base"
                placeholder="admin@puntomarisco.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-orange-200 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border-2 border-orange-500/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base"
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 sm:py-4 px-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 text-sm sm:text-base lg:text-lg ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-orange-500/25"
              }`}
            >
              {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              Sistema de Gestión Restaurante
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              La mejor experiencia en mariscos
            </p>
            
            {/* Credenciales de acceso */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-orange-500/20">
              <p className="text-orange-300 text-xs font-semibold mb-2">Credenciales de Acceso:</p>
              <div className="space-y-1 text-xs text-gray-300">
                <div>👤 <span className="text-orange-200">admin@puntomarisco.com</span> / <span className="text-orange-200">admin123</span> (Admin)</div>
                <div>👨‍💼 <span className="text-orange-200">gerente@puntomarisco.com</span> / <span className="text-orange-200">gerente123</span> (Admin)</div>
                <div>🍽️ <span className="text-orange-200">mesero1@puntomarisco.com</span> / <span className="text-orange-200">mesero123</span> (Mesero)</div>
                <div>🍽️ <span className="text-orange-200">mesero2@puntomarisco.com</span> / <span className="text-orange-200">mesero123</span> (Mesero)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional para desktop */}
        <div className="hidden lg:block mt-6 text-center">
          <p className="text-gray-400 text-sm">
            🌊 Gestión completa para tu restaurante de mariscos
          </p>
          <div className="flex justify-center items-center mt-2 space-x-4 text-xs text-gray-500">
            <span>📱 Móvil</span>
            <span>💻 Desktop</span>
            <span>☁️ Clima en tiempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
}

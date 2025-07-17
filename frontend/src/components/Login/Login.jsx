import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple validation - in real app you'd authenticate with backend
    if (email && password) {
      navigate("/");
    } else {
      alert("Por favor ingresa email y contraseña");
    }
  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-orange-500 rounded-2xl p-6 mb-4 mx-auto w-32 h-32 flex items-center justify-center">
            <div className="text-white text-4xl font-bold">
              🦐
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            <span className="text-white">PUNTO</span>
            <span className="text-orange-500">MARISCO</span>
          </h1>
          <p className="text-orange-500 text-sm">La mejor en mariscos</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <h2 className="text-white text-xl font-semibold mb-6">Inicio de Sesión</h2>
          
          <div>
            <label className="text-white text-sm block mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              className="w-full bg-transparent border-2 border-orange-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-white text-sm block mb-2">Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              className="w-full bg-transparent border-2 border-orange-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Inicia Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

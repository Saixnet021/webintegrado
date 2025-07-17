// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import FormularioPedido from "./components/Pedido/FormularioPedido";
import ResumenPedidoWrapper from "./components/Pedido/ResumenPedidoWrapper";
import PantallaCocina from "./components/Cocina/PantallaCocina";
import DashboardMesas from "./components/Mesas/DashboardMesas";
import Login from "./components/Login/Login";
import "./index.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white w-full">
      {/* iPhone-style header for home */}
      <div className="bg-orange-500 px-2 py-4.5 flex items-center justify-between w-full min-h-[70px]">
        <div className="flex items-center justify-start w-16">
          {/* Espacio vacío para mantener la estructura */}
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-3xl font-bold text-center">
            <span className="text-black">Punto</span>{" "}
            <span className="text-white">Marisco</span>
          </h1>
        </div>
        
        <div className="flex items-center justify-end w-16">
          {/* Espacio vacío para mantener la estructura */}
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-start pt-8 px-4 w-full">
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

          <button
            onClick={() => navigate("/usuarios")}
            className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
          >
            Usuarios
          </button>

          <button
            onClick={() => navigate("/reportes")}
            className="bg-black border-2 border-orange-500 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition hover:bg-orange-600 hover:text-black touch-manipulation text-lg"
          >
            Reportes
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Rutas */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/mesas" element={<DashboardMesas />} />
        <Route path="/pedido/:id" element={<FormularioPedido />} />
        <Route path="/resumen/:id" element={<ResumenPedidoWrapper />} />
        <Route path="/cocina" element={<PantallaCocina />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

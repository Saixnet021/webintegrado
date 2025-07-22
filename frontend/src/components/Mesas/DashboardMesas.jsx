import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackButton from "../UI/BackButton";
import { pedidoAPI } from "../../api/pedidoAPI";

export default function DashboardMesas() {
  const [mesas, setMesas] = useState([]);
  const [pedidosPorMesa, setPedidosPorMesa] = useState({});
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editarId, setEditarId] = useState(null);
  const [editarNombre, setEditarNombre] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const cargarMesas = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/mesas");
      setMesas(res.data);
      
      // Cargar pedidos activos para cada mesa
      const pedidosMap = {};
      for (const mesa of res.data) {
        try {
          const pedidos = await pedidoAPI.obtenerPedidosPorMesa(mesa.nombre);
          pedidosMap[mesa.nombre] = pedidos.filter(p => !p.facturado);
        } catch (error) {
          console.error(`Error al cargar pedidos de mesa ${mesa.nombre}:`, error);
          pedidosMap[mesa.nombre] = [];
        }
      }
      setPedidosPorMesa(pedidosMap);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMesas();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarMesas, 30000);
    return () => clearInterval(interval);
  }, []);

  const agregarMesa = async () => {
    if (!nuevoNombre.trim()) return alert("Ingresa un nombre");
    await axios.post("http://localhost:8080/api/mesas", { nombre: nuevoNombre });
    setNuevoNombre("");
    cargarMesas();
  };

  const eliminarMesa = async (id) => {
    if (window.confirm("Eliminar mesa?")) {
      await axios.delete(`http://localhost:8080/api/mesas/${id}`);
      cargarMesas();
    }
  };

  const iniciarEdicion = (mesa) => {
    setEditarId(mesa.id);
    setEditarNombre(mesa.nombre);
  };

  const guardarEdicion = async () => {
    if (!editarNombre.trim()) return alert("Nombre no puede estar vacío");
    await axios.put(`http://localhost:8080/api/mesas/${editarId}`, { nombre: editarNombre });
    setEditarId(null);
    setEditarNombre("");
    cargarMesas();
  };

  const getEstadoMesa = (mesa) => {
    const pedidosActivos = pedidosPorMesa[mesa.nombre] || [];
    if (pedidosActivos.length > 0) {
      return { estado: 'OCUPADA', color: 'text-red-400', bg: 'bg-red-900' };
    }
    return { estado: 'LIBRE', color: 'text-green-400', bg: 'bg-green-900' };
  };

  const handleClickMesa = (mesa) => {
    const pedidosActivos = pedidosPorMesa[mesa.nombre] || [];
    if (pedidosActivos.length > 0) {
      // Si hay pedidos activos, ir al resumen del último pedido
      const ultimoPedido = pedidosActivos[pedidosActivos.length - 1];
      navigate(`/resumen/${ultimoPedido.id}`);
    } else {
      // Si no hay pedidos, crear nuevo pedido
      navigate(`/pedido/${mesa.nombre}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white w-full overflow-hidden flex flex-col">
      <BackButton to="/" />
      <div className="px-4 py-6 w-full flex-1 overflow-y-auto">
        {/* Título con indicadores */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500 mb-4">Gestión de Mesas</h1>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Libre</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Ocupada</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 max-h-[calc(100vh-280px)] overflow-y-auto pb-4">
          {mesas.map((mesa) => {
            const estadoInfo = getEstadoMesa(mesa);
            const pedidosActivos = pedidosPorMesa[mesa.nombre] || [];
            
            return (
              <div key={mesa.id} className="w-full">
                {editarId === mesa.id ? (
                  <div className="space-y-2">
                    <input
                      value={editarNombre}
                      onChange={(e) => setEditarNombre(e.target.value)}
                      className="border p-2 w-full text-black rounded"
                    />
                    <button onClick={guardarEdicion} className="bg-green-500 text-white px-3 py-1 rounded text-sm w-full">
                      Guardar
                    </button>
                    <button onClick={() => setEditarId(null)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm w-full">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => handleClickMesa(mesa)}
                      className={`w-full h-28 bg-black text-white border-2 border-orange-500 rounded-2xl font-semibold hover:bg-orange-600 hover:text-black transition relative flex flex-col justify-center items-center touch-manipulation ${
                        estadoInfo.estado === 'OCUPADA' ? 'ring-2 ring-red-400' : ''
                      }`}
                    >
                      <div className="text-lg font-bold">{mesa.nombre}</div>
                      
                      {/* Indicador de estado */}
                      <div className={`absolute top-2 right-2 w-4 h-4 rounded-full ${
                        estadoInfo.estado === 'OCUPADA' ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      
                      {/* Información de estado */}
                      <div className="absolute bottom-2 left-3 text-xs">
                        <span className="text-white">Estado: </span>
                        <span className={estadoInfo.color}>
                          {estadoInfo.estado}
                        </span>
                      </div>
                      
                      {/* Información de pedidos activos */}
                      {pedidosActivos.length > 0 && (
                        <div className="absolute bottom-2 right-3 text-xs">
                          <span className="text-orange-400">
                            {pedidosActivos.length} pedido{pedidosActivos.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                    
                    {/* Botón de edición - Fuera del botón principal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        iniciarEdicion(mesa);
                      }}
                      className="absolute top-2 left-2 bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 rounded-full text-xs z-10"
                    >
                      ✏️
                    </button>
                    
                    {/* Botón de eliminar - Fuera del botón principal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarMesa(mesa.id);
                      }}
                      className="absolute top-10 left-2 bg-red-700 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs z-10"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 px-2">
          <input
            placeholder="Nombre nueva mesa"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            className="border p-3 flex-grow rounded text-black text-base"
          />
          <button onClick={agregarMesa} className="bg-blue-500 text-white px-4 py-3 rounded text-base font-semibold">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

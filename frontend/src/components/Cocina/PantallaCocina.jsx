import React, { useState, useEffect, useCallback } from "react";
import BackButton from "../UI/BackButton";
import sseService from "../../api/sseService";
import { pedidoAPI } from "../../api/pedidoAPI";

export default function PantallaCocina() {
  const [pedidos, setPedidos] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Desconectado");
  const [lastError, setLastError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para manejar nuevos pedidos recibidos via SSE
  const handleNewPedido = useCallback((nuevoPedido) => {
    console.log("Pedido recibido via SSE:", nuevoPedido);
    setPedidos((prev) => {
      // Buscar si el pedido ya existe
      const existingIndex = prev.findIndex(p => p.id === nuevoPedido.id);
      
      if (existingIndex !== -1) {
        // El pedido ya existe, actualizarlo manteniendo el estado de los checkboxes
        const pedidosActualizados = [...prev];
        pedidosActualizados[existingIndex] = {
          ...nuevoPedido,
          // Mantener el estado de los checkboxes del pedido existente
          enProceso: prev[existingIndex].enProceso || false,
          terminado: prev[existingIndex].terminado || false
        };
        console.log("Pedido actualizado en cocina:", nuevoPedido.id);
        return pedidosActualizados;
      } else {
        // Es un pedido nuevo, agregarlo con estado inicial
        const pedidoConEstado = {
          ...nuevoPedido,
          enProceso: false,
          terminado: false
        };
        console.log("Nuevo pedido agregado a cocina:", nuevoPedido.id);
        return [...prev, pedidoConEstado];
      }
    });
  }, []);

  // Función para manejar errores de conexión
  const handleError = useCallback((error) => {
    console.error("Error en SSE:", error);
    setLastError(error.message || "Error de conexión");
  }, []);

  // Función para manejar cambios en el estado de conexión
  const handleConnectionStatus = useCallback((status) => {
    setConnectionStatus(status);
    if (status === "Conectado") {
      setLastError(null);
    }
  }, []);

  // Función para forzar reconexión
  const handleReconnect = () => {
    console.log('🔄 Usuario solicitó reconexión manual');
    setLastError(null);
    setConnectionStatus('Conectando...');
    sseService.forceReconnect();
  };

  // Función para manejar cambio de estado "En proceso"
  const handleEnProcesoChange = (pedidoId, checked) => {
    setPedidos(prev => prev.map(p => 
      p.id === pedidoId ? { ...p, enProceso: checked } : p
    ));
  };

  // Función para manejar cambio de estado "Terminado"
  const handleTerminadoChange = (pedidoId, checked) => {
    setPedidos(prev => prev.map(p => 
      p.id === pedidoId ? { ...p, terminado: checked } : p
    ));
  };

  // Función para calcular tiempo transcurrido
  const calcularTiempoTranscurrido = (hora) => {
    const ahora = new Date();
    const horaInicio = new Date(hora);
    const diferencia = Math.floor((ahora - horaInicio) / 1000 / 60); // en minutos
    const horas = Math.floor(diferencia / 60);
    const minutos = diferencia % 60;
    
    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${(diferencia * 60 % 60).toString().padStart(2, '0')}`;
  };

  // Función para cargar pedidos del día al iniciar
  const cargarPedidosDelDia = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Cargando pedidos del día...");
      const pedidosDelDia = await pedidoAPI.obtenerPedidosDelDia();
      
      // Agregar estado inicial de checkboxes a cada pedido
      const pedidosConEstado = pedidosDelDia.map(pedido => ({
        ...pedido,
        enProceso: false,
        terminado: false
      }));
      
      setPedidos(pedidosConEstado);
      console.log(`Cargados ${pedidosConEstado.length} pedidos del día`);
    } catch (error) {
      console.error("Error al cargar pedidos del día:", error);
      setLastError("Error al cargar pedidos del día");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cargar pedidos del día al iniciar
    cargarPedidosDelDia();

    // Registrar handlers
    sseService.addMessageHandler(handleNewPedido);
    sseService.addErrorHandler(handleError);
    sseService.addConnectionStatusHandler(handleConnectionStatus);

    // Inicializar conexión
    sseService.connect().catch(error => {
      console.error("Error inicial de conexión SSE:", error);
    });

    // Cleanup al desmontar el componente
    return () => {
      // Remover handlers específicos de este componente
      sseService.removeMessageHandler(handleNewPedido);
      sseService.removeErrorHandler(handleError);
      sseService.removeConnectionStatusHandler(handleConnectionStatus);
      
      // NO desconectar el servicio aquí ya que es un singleton
      // y otros componentes podrían estar usándolo
    };
  }, [handleNewPedido, handleError, handleConnectionStatus, cargarPedidosDelDia]);

  // Función para obtener el color del indicador de estado
  const getStatusColor = () => {
    if (connectionStatus === "Conectado") return "bg-green-500";
    if (connectionStatus === "Conectando..." || connectionStatus.includes("Reintentando")) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white w-full">
      <BackButton to="/" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Pedidos en Cocina</h2>
            <p className="text-sm text-gray-400 mt-1">
              Mostrando todos los pedidos del día ({new Date().toLocaleDateString()})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={cargarPedidosDelDia}
              disabled={loading}
              className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                loading 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Cargando..." : "🔄 Actualizar"}
            </button>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <span className="text-sm">{connectionStatus}</span>
            </div>
            {(connectionStatus === "Desconectado" || connectionStatus === "Conexión fallida" || lastError) && (
              <button
                onClick={handleReconnect}
                disabled={connectionStatus === "Conectando..."}
                className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                  connectionStatus === "Conectando..." 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {connectionStatus === "Conectando..." ? "Conectando..." : "Reconectar"}
              </button>
            )}
          </div>
        </div>

        {lastError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-500 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <span className="text-red-200 text-sm">⚠️ {lastError}</span>
                <div className="text-xs text-red-300 mt-1">
                  Verifica que el backend esté ejecutándose en http://localhost:8080/api/sse/pedidos
                </div>
              </div>
              <button
                onClick={() => setLastError(null)}
                className="text-red-300 hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center text-gray-400 mt-10">
            <p>Cargando pedidos del día...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>No hay pedidos del día</p>
            <p className="text-sm mt-2">Los nuevos pedidos aparecerán aquí en tiempo real</p>
            {connectionStatus !== "Conectado" && (
              <p className="text-sm mt-2 text-yellow-400">
                Esperando conexión SSE...
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidos.map((pedido, index) => (
              <div
                key={pedido.id}
                className={`p-4 border-2 border-orange-500 rounded-lg bg-gray-800 transition-opacity duration-300 ${
                  pedido.terminado ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center">
                      P0{index + 1}: Mesa {pedido.mesa} - {new Date(pedido.hora).toLocaleTimeString()}
                      {/* Indicador de pedido editado */}
                      {pedido.detalles && pedido.detalles.some(d => d.estado === 'EDITADO' || d.estado === 'AGREGADO') && (
                        <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          EDITADO
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Tiempo transcurrido - {calcularTiempoTranscurrido(pedido.hora)}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {pedido.detalles && pedido.detalles.map((detalle, i) => (
                    <li key={i} className="text-white flex items-center">
                      <span className="text-white mr-2">•</span>
                      <span className="font-medium">{detalle.cantidad || 1}</span>
                      <span className="ml-1">{detalle.plato}</span>
                      {detalle.notas && detalle.notas.toLowerCase().includes('cancelado') && (
                        <span className="text-red-500 ml-2 font-bold">- CANCELADO</span>
                      )}
                      {detalle.notas && detalle.notas.toLowerCase().includes('modificado') && (
                        <span className="text-green-500 ml-2 font-bold">- MODIFICADO</span>
                      )}
                      {detalle.notas && !detalle.notas.toLowerCase().includes('cancelado') && !detalle.notas.toLowerCase().includes('modificado') && (
                        <span className="text-yellow-300 ml-2">
                          - {detalle.notas}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="flex justify-end space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-white text-sm">En proceso:</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={pedido.enProceso || false}
                        onChange={(e) => handleEnProcesoChange(pedido.id, e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 border-orange-500 rounded ${
                        pedido.enProceso ? 'bg-orange-500' : 'bg-transparent'
                      }`}>
                        {pedido.enProceso && (
                          <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-white text-sm">Terminado:</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={pedido.terminado || false}
                        onChange={(e) => handleTerminadoChange(pedido.id, e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 border-orange-500 rounded ${
                        pedido.terminado ? 'bg-orange-500' : 'bg-transparent'
                      }`}>
                        {pedido.terminado && (
                          <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

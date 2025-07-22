import React, { useState, useEffect } from "react";
import { cajaAPI } from "../../api/cajaAPI";
import { pedidoAPI } from "../../api/pedidoAPI";
import BackButton from "../UI/BackButton";

export default function CierreCaja() {
  const [estadoCaja, setEstadoCaja] = useState(null);
  const [pedidosHoy, setPedidosHoy] = useState([]);
  const [totalVentas, setTotalVentas] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar estado de caja
      const caja = await cajaAPI.obtenerEstadoCaja();
      setEstadoCaja(caja);
      
      // Cargar pedidos del día
      const pedidos = await pedidoAPI.obtenerPedidosDelDia();
      setPedidosHoy(pedidos);
      
      // Calcular total de ventas
      const total = pedidos
        .filter(pedido => pedido.facturado)
        .reduce((sum, pedido) => sum + (pedido.total || 0), 0);
      setTotalVentas(total);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar los datos de la caja");
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!window.confirm("¿Está seguro de cerrar la caja? Esta acción no se puede deshacer.")) {
      return;
    }

    setLoading(true);
    try {
      await cajaAPI.cerrarCaja(observaciones, totalVentas);
      alert("Caja cerrada exitosamente");
      await cargarDatos(); // Recargar datos
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      alert("Error al cerrar la caja. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaja = async () => {
    if (!window.confirm("¿Está seguro de reabrir la caja?")) {
      return;
    }

    setLoading(true);
    try {
      await cajaAPI.abrirCaja();
      alert("Caja reabierta exitosamente");
      await cargarDatos(); // Recargar datos
    } catch (error) {
      console.error("Error al abrir caja:", error);
      alert("Error al abrir la caja. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando datos de caja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white">
      <BackButton to="/mesas" />
      
      <div className="px-4 py-6 pb-32 max-h-screen overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">
            {estadoCaja?.abierta ? "Cierre de Caja" : "Caja Cerrada"}
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Estado de la Caja */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
          <h2 className="text-lg font-semibold text-orange-400 mb-3">Estado de la Caja</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={`font-semibold ${estadoCaja?.abierta ? 'text-green-400' : 'text-red-400'}`}>
                {estadoCaja?.abierta ? 'ABIERTA' : 'CERRADA'}
              </span>
            </div>
            {estadoCaja?.horaApertura && (
              <div className="flex justify-between">
                <span>Hora de Apertura:</span>
                <span>{new Date(estadoCaja.horaApertura).toLocaleTimeString()}</span>
              </div>
            )}
            {estadoCaja?.horaCierre && (
              <div className="flex justify-between">
                <span>Hora de Cierre:</span>
                <span>{new Date(estadoCaja.horaCierre).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Ventas */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
          <h2 className="text-lg font-semibold text-orange-400 mb-3">Resumen de Ventas</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pedidos Totales:</span>
              <span className="font-semibold">{pedidosHoy.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Pedidos Facturados:</span>
              <span className="font-semibold text-green-400">
                {pedidosHoy.filter(p => p.facturado).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pedidos Pendientes:</span>
              <span className="font-semibold text-yellow-400">
                {pedidosHoy.filter(p => !p.facturado).length}
              </span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total de Ventas:</span>
                <span className="font-bold text-orange-500">
                  S/ {totalVentas.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {estadoCaja?.abierta && (
          <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
            <h2 className="text-lg font-semibold text-orange-400 mb-3">Observaciones</h2>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese observaciones sobre el cierre de caja (opcional)"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none h-24"
            />
          </div>
        )}

        {/* Observaciones de cierre (si la caja está cerrada) */}
        {!estadoCaja?.abierta && estadoCaja?.observaciones && (
          <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
            <h2 className="text-lg font-semibold text-orange-400 mb-3">Observaciones del Cierre</h2>
            <p className="text-gray-300">{estadoCaja.observaciones}</p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="space-y-3">
          {estadoCaja?.abierta ? (
            <button
              onClick={handleCerrarCaja}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-semibold text-lg ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {loading ? "Cerrando Caja..." : "🔒 Cerrar Caja"}
            </button>
          ) : (
            <button
              onClick={handleAbrirCaja}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-semibold text-lg ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Abriendo Caja..." : "🔓 Reabrir Caja"}
            </button>
          )}
          
          <button
            onClick={() => window.location.href = "/reportes"}
            className="w-full py-4 rounded-2xl font-semibold text-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            📊 Ver Reportes
          </button>
        </div>
      </div>
    </div>
  );
}

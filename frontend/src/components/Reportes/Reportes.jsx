import React, { useState, useEffect } from "react";
import { pedidoAPI } from "../../api/pedidoAPI";
import BackButton from "../UI/BackButton";

export default function Reportes() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [mesaSeleccionada, setMesaSeleccionada] = useState("todas");
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalPedidos: 0,
    pedidosFacturados: 0,
    pedidosPendientes: 0,
    totalVentas: 0,
    ventasPorMesa: {}
  });

  const mesas = Array.from({length: 20}, (_, i) => i + 1); // Mesas del 1 al 20

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [pedidos, fechaSeleccionada, mesaSeleccionada]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      // Usar obtenerPedidosDelDia para obtener solo los pedidos del día actual
      const pedidosDelDia = await pedidoAPI.obtenerPedidosDelDia();
      setPedidos(pedidosDelDia || []);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      alert("Error al cargar los pedidos. Verifique que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  const filtrarPedidos = () => {
    let filtrados = pedidos;

    // Como el endpoint /del-dia ya devuelve pedidos del día actual,
    // solo filtramos por mesa si es necesario
    if (mesaSeleccionada !== "todas") {
      filtrados = filtrados.filter(pedido => 
        pedido.mesa.toString() === mesaSeleccionada
      );
    }

    setPedidosFiltrados(filtrados);
    calcularEstadisticas(filtrados);
  };

  const calcularEstadisticas = (pedidosFiltrados) => {
    const totalPedidos = pedidosFiltrados.length;
    const pedidosFacturados = pedidosFiltrados.filter(p => p.facturado).length;
    const pedidosPendientes = totalPedidos - pedidosFacturados;
    const totalVentas = pedidosFiltrados
      .filter(p => p.facturado)
      .reduce((sum, p) => sum + (p.total || 0), 0);

    // Calcular ventas por mesa
    const ventasPorMesa = {};
    pedidosFiltrados.forEach(pedido => {
      const mesa = pedido.mesa;
      if (!ventasPorMesa[mesa]) {
        ventasPorMesa[mesa] = {
          totalPedidos: 0,
          pedidosFacturados: 0,
          totalVentas: 0
        };
      }
      ventasPorMesa[mesa].totalPedidos++;
      if (pedido.facturado) {
        ventasPorMesa[mesa].pedidosFacturados++;
        ventasPorMesa[mesa].totalVentas += pedido.total || 0;
      }
    });

    setEstadisticas({
      totalPedidos,
      pedidosFacturados,
      pedidosPendientes,
      totalVentas,
      ventasPorMesa
    });
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportarReporte = () => {
    const datos = pedidosFiltrados.map(pedido => ({
      ID: pedido.id,
      Mesa: pedido.mesa,
      Fecha: formatearFecha(pedido.hora),
      Estado: pedido.estado,
      Facturado: pedido.facturado ? 'Sí' : 'No',
      Total: `S/ ${(pedido.total || 0).toFixed(2)}`,
      Detalles: pedido.detalles?.map(d => `${d.cantidad}x ${d.plato}`).join(', ') || ''
    }));

    const csv = [
      Object.keys(datos[0] || {}).join(','),
      ...datos.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${fechaSeleccionada}_mesa_${mesaSeleccionada}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white">
      <BackButton to="/" />
      
      <div className="px-4 py-6 pb-32 max-h-screen overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">Reportes</h1>
          <p className="text-gray-300 text-sm mt-1">
            Análisis de ventas por día y mesa
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
          <h2 className="text-lg font-semibold text-orange-400 mb-3">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha:</label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mesa:</label>
              <select
                value={mesaSeleccionada}
                onChange={(e) => setMesaSeleccionada(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="todas">Todas las mesas</option>
                {mesas.map(mesa => (
                  <option key={mesa} value={mesa}>Mesa {mesa}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
          <h2 className="text-lg font-semibold text-orange-400 mb-3">Resumen General</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{estadisticas.totalPedidos}</div>
              <div className="text-sm text-gray-300">Total Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{estadisticas.pedidosFacturados}</div>
              <div className="text-sm text-gray-300">Facturados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{estadisticas.pedidosPendientes}</div>
              <div className="text-sm text-gray-300">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">S/ {estadisticas.totalVentas.toFixed(2)}</div>
              <div className="text-sm text-gray-300">Total Ventas</div>
            </div>
          </div>
        </div>

        {/* Reporte por Mesa */}
        {mesaSeleccionada === "todas" && Object.keys(estadisticas.ventasPorMesa).length > 0 && (
          <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
            <h2 className="text-lg font-semibold text-orange-400 mb-3">Reporte por Mesa</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">Mesa</th>
                    <th className="text-center py-2">Pedidos</th>
                    <th className="text-center py-2">Facturados</th>
                    <th className="text-right py-2">Total Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(estadisticas.ventasPorMesa)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([mesa, datos]) => (
                    <tr key={mesa} className="border-b border-gray-700">
                      <td className="py-2 font-medium">Mesa {mesa}</td>
                      <td className="text-center py-2">{datos.totalPedidos}</td>
                      <td className="text-center py-2 text-green-400">{datos.pedidosFacturados}</td>
                      <td className="text-right py-2 text-orange-500">S/ {datos.totalVentas.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lista de Pedidos */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-orange-500 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-orange-400">
              Detalle de Pedidos ({pedidosFiltrados.length})
            </h2>
            {pedidosFiltrados.length > 0 && (
              <button
                onClick={exportarReporte}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                📊 Exportar CSV
              </button>
            )}
          </div>
          
          {pedidosFiltrados.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No se encontraron pedidos para los filtros seleccionados
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pedidosFiltrados.map(pedido => (
                <div key={pedido.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-orange-400">Pedido #{pedido.id}</span>
                      <span className="ml-2 text-sm text-gray-300">Mesa {pedido.mesa}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-500 font-semibold">S/ {(pedido.total || 0).toFixed(2)}</div>
                      <div className={`text-xs ${pedido.facturado ? 'text-green-400' : 'text-yellow-400'}`}>
                        {pedido.facturado ? 'Facturado' : 'Pendiente'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-1">
                    {formatearFecha(pedido.hora)}
                  </div>
                  {pedido.detalles && pedido.detalles.length > 0 && (
                    <div className="text-sm text-gray-400">
                      {pedido.detalles.map((detalle, idx) => (
                        <span key={idx}>
                          {detalle.cantidad}x {detalle.plato}
                          {idx < pedido.detalles.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Actualizar */}
        <button
          onClick={cargarPedidos}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-semibold text-lg ${
            loading
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {loading ? "Actualizando..." : "🔄 Actualizar Datos"}
        </button>
      </div>
    </div>
  );
}

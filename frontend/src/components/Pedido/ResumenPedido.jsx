import React, { useState } from "react";
import BackButton from "../UI/BackButton";

export default function ResumenPedido({ pedido, onFacturar, onEditar }) {
  const [loading, setLoading] = useState(false);

  const calcularTotal = () => {
    if (!pedido?.detalles) return 0;
    return pedido.detalles.reduce((total, detalle) => {
      return total + (detalle.precio * detalle.cantidad);
    }, 0);
  };

  const handleFacturar = async () => {
    setLoading(true);
    try {
      await onFacturar(pedido.id);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = () => {
    onEditar(pedido.id);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!pedido) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <p>No se encontró información del pedido</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white">
      <BackButton to="/mesas" />
      
      <div className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            ¡Pedido Enviado!
          </h1>
          <p className="text-gray-300">
            Tu pedido ha sido enviado a cocina exitosamente
          </p>
        </div>

        {/* Información del pedido */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-orange-500">
                Pedido #{pedido.id}
              </h2>
              <p className="text-gray-300">Mesa: {pedido.mesa}</p>
              <p className="text-gray-400 text-sm">
                {formatearFecha(pedido.hora)}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                pedido.estado === 'EN_PROCESO' ? 'bg-yellow-600 text-yellow-100' :
                pedido.estado === 'LISTO' ? 'bg-green-600 text-green-100' :
                'bg-gray-600 text-gray-100'
              }`}>
                {pedido.estado === 'EN_PROCESO' ? 'En Proceso' :
                 pedido.estado === 'LISTO' ? 'Listo' :
                 pedido.estado}
              </span>
            </div>
          </div>

          {/* Detalles del pedido */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-3">Detalles del Pedido:</h3>
            <div className="space-y-3">
              {pedido.detalles?.map((detalle, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{detalle.cantidad}x</span>
                      <span>{detalle.plato}</span>
                      {detalle.estado === 'EDITADO' && (
                        <span className="text-green-400 text-xs bg-green-900 px-2 py-1 rounded">
                          EDITADO
                        </span>
                      )}
                      {detalle.estado === 'AGREGADO' && (
                        <span className="text-blue-400 text-xs bg-blue-900 px-2 py-1 rounded">
                          AGREGADO
                        </span>
                      )}
                    </div>
                    {detalle.notas && (
                      <p className="text-yellow-300 text-sm mt-1">
                        Notas: {detalle.notas}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      S/ {(detalle.precio * detalle.cantidad).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-orange-500 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-orange-500">
                  S/ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-4">
          <button
            onClick={handleFacturar}
            disabled={loading || pedido.facturado}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              pedido.facturado
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : loading
                ? 'bg-green-700 text-green-200 cursor-wait'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Procesando...' : 
             pedido.facturado ? 'Ya Facturado' : 
             '💳 Facturar Mesa'}
          </button>

          <button
            onClick={handleEditar}
            disabled={pedido.facturado}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              pedido.facturado
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            ✏️ Editar Pedido
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-400 text-sm">
              El pedido está siendo preparado en cocina
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResumenPedido from "./ResumenPedido";
import { pedidoAPI } from "../../api/pedidoAPI";

export default function ResumenPedidoWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        setLoading(true);
        const pedidoData = await pedidoAPI.obtenerPedidoPorId(id);
        setPedido(pedidoData);
      } catch (err) {
        console.error('Error al cargar pedido:', err);
        setError('No se pudo cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarPedido();
    }
  }, [id]);

  const handleFacturar = async (pedidoId) => {
    try {
      const pedidoFacturado = await pedidoAPI.facturarPedido(pedidoId);
      setPedido(pedidoFacturado);
      
      // Mostrar mensaje de éxito y redirigir después de un momento
      setTimeout(() => {
        navigate('/mesas');
      }, 2000);
      
      return pedidoFacturado;
    } catch (error) {
      console.error('Error al facturar:', error);
      throw error;
    }
  };

  const handleEditar = (pedidoId) => {
    navigate(`/pedido/${pedido.mesa}?edit=${pedidoId}`);
  };

  if (loading) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/mesas')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Volver a Mesas
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResumenPedido
      pedido={pedido}
      onFacturar={handleFacturar}
      onEditar={handleEditar}
    />
  );
}

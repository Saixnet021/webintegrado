// src/Components/Pedido/FormularioPedido.jsx
import React, { useState, useEffect } from "react";
import platosPredefinidos from "../../data/platos.json";
import { crearPedido } from "../../api/pedidoAPI";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "../UI/BackButton";
import { pedidoAPI } from "../../api/pedidoAPI";

export default function FormularioPedido() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [platos, setPlatos] = useState([{ plato: "", cantidad: 1, notas: "", precio: 0 }]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pedidoOriginal, setPedidoOriginal] = useState(null);

  // Crear mapa de precios desde el JSON
  const preciosPlatos = {};
  platosPredefinidos.forEach(plato => {
    if (typeof plato === 'object' && plato.nombre && plato.precio) {
      preciosPlatos[plato.nombre] = plato.precio;
    } else if (typeof plato === 'string') {
      // Fallback para strings simples
      preciosPlatos[plato] = 0;
    }
  });

  useEffect(() => {
    if (editId) {
      cargarPedidoParaEditar();
    }
  }, [editId]);

  const cargarPedidoParaEditar = async () => {
    try {
      setLoading(true);
      const pedido = await pedidoAPI.obtenerPedidoPorId(editId);
      setPedidoOriginal(pedido);
      setIsEditing(true);
      
      // Cargar los detalles del pedido en el formulario
      const platosConPrecio = pedido.detalles.map(detalle => ({
        plato: detalle.plato,
        cantidad: detalle.cantidad || 1,
        notas: detalle.notas || "",
        precio: detalle.precio || preciosPlatos[detalle.plato] || 0
      }));
      
      setPlatos(platosConPrecio);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      alert('Error al cargar el pedido para editar');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarPlato = () => {
    setPlatos([...platos, { plato: "", cantidad: 1, notas: "", precio: 0 }]);
  };

  const handleEliminarPlato = (index) => {
    if (platos.length > 1) {
      const nuevosPlatos = platos.filter((_, i) => i !== index);
      setPlatos(nuevosPlatos);
    }
  };

  const handleCambioPlato = (index, campo, valor) => {
    const nuevosPlatos = [...platos];
    nuevosPlatos[index][campo] = valor;
    
    // Si cambió el plato, actualizar el precio
    if (campo === 'plato') {
      nuevosPlatos[index].precio = preciosPlatos[valor] || 0;
    }
    
    setPlatos(nuevosPlatos);
  };

  const handleCambioCantidad = (index, incremento) => {
    const nuevosPlatos = [...platos];
    const nuevaCantidad = Math.max(1, (nuevosPlatos[index].cantidad || 1) + incremento);
    nuevosPlatos[index].cantidad = nuevaCantidad;
    setPlatos(nuevosPlatos);
  };

  const calcularTotal = () => {
    return platos.reduce((total, plato) => {
      return total + (plato.precio * plato.cantidad);
    }, 0);
  };

  const validarPedido = () => {
    const platosValidos = platos.filter(p => p.plato.trim() !== '');
    if (platosValidos.length === 0) {
      alert('Debe agregar al menos un plato');
      return false;
    }
    return true;
  };

  const handleEnviar = async () => {
    if (!validarPedido()) return;
    
    setLoading(true);
    try {
      const platosValidos = platos.filter(p => p.plato.trim() !== '');
      
      if (isEditing) {
        // Actualizar pedido existente
        const pedidoActualizado = {
          ...pedidoOriginal,
          detalles: platosValidos
        };
        
        const resultado = await pedidoAPI.actualizarPedido(editId, pedidoActualizado);
        navigate(`/resumen/${resultado.id}`);
      } else {
        // Crear nuevo pedido
        const pedido = {
          mesa: id,
          detalles: platosValidos,
        };
        
        const resultado = await crearPedido(pedido);
        navigate(`/resumen/${resultado.id}`);
      }
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      alert('Error al procesar el pedido. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !pedidoOriginal) {
    return (
      <div className="bg-[#1B1B1B] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1B1B] min-h-screen text-white w-full">
      <BackButton to="/mesas" showEditIcon={true} />
      <div className="px-4 py-6 w-full">
        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">
            {isEditing ? `Editando Pedido #${editId}` : `Mesa ${id}`}
          </h1>
          {isEditing && (
            <p className="text-gray-300 text-sm mt-1">
              Modifica los platos y guarda los cambios
            </p>
          )}
        </div>

        <div className="space-y-4">
          {platos.map((item, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-2xl border border-orange-500 relative">
              {/* Botón eliminar plato */}
              {platos.length > 1 && (
                <button
                  onClick={() => handleEliminarPlato(index)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full text-sm font-bold"
                >
                  ✕
                </button>
              )}
              
              <select
                value={item.plato}
                onChange={(e) => handleCambioPlato(index, "plato", e.target.value)}
                className="border-2 border-orange-500 p-3 mb-3 w-full text-black rounded-lg text-base bg-white"
              >
                <option value="">-- Selecciona un plato --</option>
                {platosPredefinidos.map((plato, i) => {
                  const nombre = typeof plato === 'object' ? plato.nombre : plato;
                  const precio = typeof plato === 'object' ? plato.precio : 0;
                  return (
                    <option key={i} value={nombre}>
                      {nombre} - S/ {precio.toFixed(2)}
                    </option>
                  );
                })}
              </select>
              
              {/* Mostrar precio si hay plato seleccionado */}
              {item.plato && (
                <div className="text-orange-400 text-sm mb-2">
                  Precio: S/ {item.precio.toFixed(2)} c/u
                </div>
              )}
              
              <div className="flex gap-2 mb-3 items-center">
                <span className="text-white text-sm w-16">Cantidad:</span>
                <button 
                  onClick={() => handleCambioCantidad(index, -1)}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-lg text-xl font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.cantidad || 1}
                  onChange={(e) =>
                    handleCambioPlato(index, "cantidad", parseInt(e.target.value) || 1)
                  }
                  className="border-2 border-orange-500 p-2 w-16 text-black rounded-lg text-base bg-white text-center"
                />
                <button 
                  onClick={() => handleCambioCantidad(index, 1)}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-lg text-xl font-bold"
                >
                  +
                </button>
                {item.plato && (
                  <div className="ml-auto text-orange-400 font-semibold">
                    Subtotal: S/ {(item.precio * item.cantidad).toFixed(2)}
                  </div>
                )}
              </div>
              
              <textarea
                placeholder="Notas (opcional)"
                value={item.notas}
                onChange={(e) => handleCambioPlato(index, "notas", e.target.value)}
                className="border-2 border-orange-500 p-3 w-full text-black rounded-lg text-base bg-white h-20 resize-none"
              />
            </div>
          ))}
        </div>
        
        {/* Total */}
        {calcularTotal() > 0 && (
          <div className="bg-gray-800 p-4 rounded-2xl border-2 border-orange-500 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-orange-500">
                S/ {calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAgregarPlato}
            disabled={loading}
            className="bg-black border-2 border-orange-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg touch-manipulation flex-1 disabled:opacity-50"
          >
            + Agregar Plato
          </button>
          <button
            onClick={handleEnviar}
            disabled={loading}
            className={`px-6 py-4 rounded-2xl font-semibold text-lg touch-manipulation flex-1 ${
              loading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {loading ? 'Procesando...' : isEditing ? '💾 Guardar Cambios' : '🚀 Enviar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}

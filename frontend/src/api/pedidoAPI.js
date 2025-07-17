import axios from "axios";

const API_URL = "http://localhost:8080/api/pedidos";

// Crear pedido
export const crearPedido = (pedido) => axios.post(API_URL, pedido);

// Obtener todos los pedidos
export const obtenerPedidos = () => axios.get(API_URL);

// Obtener pedido por ID
export const obtenerPedidoPorId = (id) => axios.get(`${API_URL}/${id}`);

// Obtener pedidos por mesa
export const obtenerPedidosPorMesa = (mesa) => axios.get(`${API_URL}/mesa/${mesa}`);

// Actualizar pedido
export const actualizarPedido = (id, pedido) => axios.put(`${API_URL}/${id}`, pedido);

// Facturar pedido
export const facturarPedido = (id) => axios.put(`${API_URL}/${id}/facturar`);

// Actualizar estado del pedido
export const actualizarEstadoPedido = (id, estado) => 
  axios.put(`${API_URL}/${id}/estado?estado=${estado}`);

// Eliminar pedido
export const eliminarPedido = (id) => axios.delete(`${API_URL}/${id}`);

// Obtener pedidos activos
export const obtenerPedidosActivos = () => axios.get(`${API_URL}/activos`);

// API object para compatibilidad
export const pedidoAPI = {
  crearPedido: async (pedido) => {
    try {
      const response = await crearPedido(pedido);
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  },

  obtenerPedidos: async () => {
    try {
      const response = await obtenerPedidos();
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  },

  obtenerPedidoPorId: async (id) => {
    try {
      const response = await obtenerPedidoPorId(id);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw error;
    }
  },

  obtenerPedidosPorMesa: async (mesa) => {
    try {
      const response = await obtenerPedidosPorMesa(mesa);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos por mesa:', error);
      throw error;
    }
  },

  actualizarPedido: async (id, pedido) => {
    try {
      const response = await actualizarPedido(id, pedido);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      throw error;
    }
  },

  facturarPedido: async (id) => {
    try {
      const response = await facturarPedido(id);
      return response.data;
    } catch (error) {
      console.error('Error al facturar pedido:', error);
      throw error;
    }
  },

  actualizarEstadoPedido: async (id, estado) => {
    try {
      const response = await actualizarEstadoPedido(id, estado);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  },

  eliminarPedido: async (id) => {
    try {
      await eliminarPedido(id);
      return true;
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      throw error;
    }
  },

  obtenerPedidosActivos: async () => {
    try {
      const response = await obtenerPedidosActivos();
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos activos:', error);
      throw error;
    }
  }
};

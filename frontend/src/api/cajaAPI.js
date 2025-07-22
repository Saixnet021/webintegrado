import axios from "axios";

const API_URL = "http://localhost:8080/api/caja";

// Obtener estado actual de la caja
export const obtenerEstadoCaja = () => axios.get(`${API_URL}/estado`);

// Verificar si la caja está abierta
export const isCajaAbierta = () => axios.get(`${API_URL}/abierta`);

// Cerrar caja
export const cerrarCaja = (observaciones, totalVentas) => 
  axios.post(`${API_URL}/cerrar`, { observaciones, totalVentas });

// Abrir caja
export const abrirCaja = () => axios.post(`${API_URL}/abrir`);

// Obtener historial de cajas
export const obtenerHistorialCajas = () => axios.get(`${API_URL}/historial`);

// Obtener cajas por rango de fechas
export const obtenerCajasPorRango = (fechaInicio, fechaFin) => 
  axios.get(`${API_URL}/rango`, {
    params: {
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    }
  });

// Obtener caja por fecha específica
export const obtenerCajaPorFecha = (fecha) => 
  axios.get(`${API_URL}/fecha/${fecha.toISOString()}`);

// API object para compatibilidad
export const cajaAPI = {
  obtenerEstadoCaja: async () => {
    try {
      const response = await obtenerEstadoCaja();
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado de caja:', error);
      throw error;
    }
  },

  isCajaAbierta: async () => {
    try {
      const response = await isCajaAbierta();
      return response.data;
    } catch (error) {
      console.error('Error al verificar estado de caja:', error);
      throw error;
    }
  },

  cerrarCaja: async (observaciones, totalVentas) => {
    try {
      const response = await cerrarCaja(observaciones, totalVentas);
      return response.data;
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      throw error;
    }
  },

  abrirCaja: async () => {
    try {
      const response = await abrirCaja();
      return response.data;
    } catch (error) {
      console.error('Error al abrir caja:', error);
      throw error;
    }
  },

  obtenerHistorialCajas: async () => {
    try {
      const response = await obtenerHistorialCajas();
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  },

  obtenerCajasPorRango: async (fechaInicio, fechaFin) => {
    try {
      const response = await obtenerCajasPorRango(fechaInicio, fechaFin);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cajas por rango:', error);
      throw error;
    }
  },

  obtenerCajaPorFecha: async (fecha) => {
    try {
      const response = await obtenerCajaPorFecha(fecha);
      return response.data;
    } catch (error) {
      console.error('Error al obtener caja por fecha:', error);
      throw error;
    }
  }
};

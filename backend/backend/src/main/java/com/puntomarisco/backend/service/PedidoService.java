package com.puntomarisco.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.puntomarisco.backend.controller.SSEController;
import com.puntomarisco.backend.model.DetallePedido;
import com.puntomarisco.backend.model.Mesa;
import com.puntomarisco.backend.model.Pedido;
import com.puntomarisco.backend.repository.MesaRepository;
import com.puntomarisco.backend.repository.PedidoRepository;

@Service
@Transactional
public class PedidoService {

    private static final Logger logger = LoggerFactory.getLogger(PedidoService.class);

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private SSEController sseController;

    public Pedido guardarPedidoConDetalles(Pedido pedido) {
        try {
            logger.info("Guardando nuevo pedido para mesa: {}", pedido.getMesa());
            
            pedido.setHora(LocalDateTime.now());
            pedido.setEstado(Pedido.EstadoPedido.EN_PROCESO); // Automáticamente en proceso
            pedido.setFacturado(false);

            // Calcular total
            double total = 0.0;
            if (pedido.getDetalles() != null) {
                for (DetallePedido detalle : pedido.getDetalles()) {
                    detalle.setPedido(pedido);
                    if (detalle.getPrecio() != null && detalle.getCantidad() != null) {
                        total += detalle.getPrecio() * detalle.getCantidad();
                    }
                }
            }
            pedido.setTotal(total);

            Pedido pedidoGuardado = pedidoRepository.save(pedido);
            logger.info("Pedido guardado exitosamente con ID: {}", pedidoGuardado.getId());

            // Cambiar estado de mesa a OCUPADA
            cambiarEstadoMesa(pedido.getMesa(), Mesa.EstadoMesa.OCUPADA);

            // Enviar el pedido a todos los clientes conectados via SSE
            try {
                sseController.enviarNuevoPedido(pedidoGuardado);
                logger.info("Pedido enviado via SSE a {} conexiones activas", sseController.getActiveConnections());
            } catch (Exception sseException) {
                logger.error("Error al enviar pedido via SSE: {}", sseException.getMessage(), sseException);
            }

            return pedidoGuardado;
            
        } catch (Exception e) {
            logger.error("Error al guardar pedido: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar el pedido", e);
        }
    }

    public Pedido actualizarPedido(Long id, Pedido pedidoActualizado) {
        try {
            logger.info("Actualizando pedido con ID: {}", id);
            
            Pedido pedidoExistente = pedidoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));
            
            // Marcar detalles editados/agregados
            if (pedidoActualizado.getDetalles() != null) {
                for (DetallePedido detalle : pedidoActualizado.getDetalles()) {
                    if (detalle.getId() == null) {
                        // Nuevo detalle
                        detalle.setEstado(DetallePedido.EstadoDetalle.AGREGADO);
                    } else {
                        // Detalle existente modificado
                        detalle.setEstado(DetallePedido.EstadoDetalle.EDITADO);
                    }
                    detalle.setPedido(pedidoExistente);
                }
            }
            
            // Actualizar campos
            pedidoExistente.setDetalles(pedidoActualizado.getDetalles());
            
            // Recalcular total
            double total = 0.0;
            if (pedidoExistente.getDetalles() != null) {
                for (DetallePedido detalle : pedidoExistente.getDetalles()) {
                    if (detalle.getPrecio() != null && detalle.getCantidad() != null && 
                        detalle.getEstado() != DetallePedido.EstadoDetalle.CANCELADO) {
                        total += detalle.getPrecio() * detalle.getCantidad();
                    }
                }
            }
            pedidoExistente.setTotal(total);
            
            Pedido pedidoGuardado = pedidoRepository.save(pedidoExistente);
            
            // Enviar notificación de actualización via SSE
            try {
                sseController.enviarNuevoPedido(pedidoGuardado);
                logger.info("Actualización de pedido enviada via SSE");
            } catch (Exception sseException) {
                logger.error("Error al enviar actualización via SSE: {}", sseException.getMessage(), sseException);
            }
            
            return pedidoGuardado;
            
        } catch (Exception e) {
            logger.error("Error al actualizar pedido {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error al actualizar el pedido", e);
        }
    }

    public Pedido facturarPedido(Long id) {
        try {
            logger.info("Facturando pedido con ID: {}", id);
            
            Pedido pedido = pedidoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));
            
            pedido.setEstado(Pedido.EstadoPedido.FACTURADO);
            pedido.setFacturado(true);
            
            Pedido pedidoGuardado = pedidoRepository.save(pedido);
            
            // Verificar si hay más pedidos activos en la mesa
            List<Pedido> pedidosActivosMesa = pedidoRepository.findByMesaAndFacturadoFalse(pedido.getMesa());
            if (pedidosActivosMesa.isEmpty()) {
                // Cambiar estado de mesa a LIBRE solo si no hay más pedidos activos
                cambiarEstadoMesa(pedido.getMesa(), Mesa.EstadoMesa.LIBRE);
            }
            
            logger.info("Pedido facturado exitosamente");
            return pedidoGuardado;
            
        } catch (Exception e) {
            logger.error("Error al facturar pedido {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error al facturar el pedido", e);
        }
    }

    public List<Pedido> obtenerPedidos() {
        try {
            logger.debug("Obteniendo lista de todos los pedidos");
            List<Pedido> pedidos = pedidoRepository.findAll();
            logger.debug("Se encontraron {} pedidos", pedidos.size());
            return pedidos;
        } catch (Exception e) {
            logger.error("Error al obtener pedidos: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener la lista de pedidos", e);
        }
    }

    public List<Pedido> obtenerPorMesa(String mesa) {
        try {
            logger.debug("Obteniendo pedidos activos para mesa: {}", mesa);
            List<Pedido> pedidos = pedidoRepository.findByMesaAndFacturadoFalse(mesa);
            logger.debug("Se encontraron {} pedidos activos para la mesa {}", pedidos.size(), mesa);
            return pedidos;
        } catch (Exception e) {
            logger.error("Error al obtener pedidos de la mesa {}: {}", mesa, e.getMessage(), e);
            throw new RuntimeException("Error al obtener pedidos de la mesa", e);
        }
    }

    public Pedido obtenerPorId(Long id) {
        try {
            logger.debug("Obteniendo pedido con ID: {}", id);
            return pedidoRepository.findById(id).orElse(null);
        } catch (Exception e) {
            logger.error("Error al obtener pedido {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error al obtener el pedido", e);
        }
    }

    public Pedido actualizarEstadoPedido(Long pedidoId, String nuevoEstado) {
        try {
            logger.info("Actualizando estado del pedido {} a: {}", pedidoId, nuevoEstado);
            
            Pedido pedido = pedidoRepository.findById(pedidoId)
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + pedidoId));
            
            // Convertir string a enum si es necesario
            try {
                Pedido.EstadoPedido estadoEnum = Pedido.EstadoPedido.valueOf(nuevoEstado.toUpperCase());
                pedido.setEstado(estadoEnum);
            } catch (IllegalArgumentException e) {
                logger.warn("Estado no válido: {}, usando como string", nuevoEstado);
                // Mantener compatibilidad con estados string
            }
            
            Pedido pedidoActualizado = pedidoRepository.save(pedido);
            
            // Notificar cambio de estado via SSE
            try {
                sseController.enviarNuevoPedido(pedidoActualizado);
                logger.info("Cambio de estado enviado via SSE");
            } catch (Exception sseException) {
                logger.error("Error al enviar cambio de estado via SSE: {}", sseException.getMessage(), sseException);
            }
            
            return pedidoActualizado;
            
        } catch (Exception e) {
            logger.error("Error al actualizar estado del pedido {}: {}", pedidoId, e.getMessage(), e);
            throw new RuntimeException("Error al actualizar el estado del pedido", e);
        }
    }

    public void eliminarPedido(Long pedidoId) {
        try {
            logger.info("Eliminando pedido con ID: {}", pedidoId);
            
            Pedido pedido = pedidoRepository.findById(pedidoId).orElse(null);
            if (pedido == null) {
                throw new RuntimeException("Pedido no encontrado con ID: " + pedidoId);
            }
            
            // Verificar si hay más pedidos activos en la mesa
            List<Pedido> pedidosActivosMesa = obtenerPorMesa(pedido.getMesa());
            if (pedidosActivosMesa.size() <= 1) {
                // Liberar mesa si es el último pedido
                cambiarEstadoMesa(pedido.getMesa(), Mesa.EstadoMesa.LIBRE);
            }
            
            pedidoRepository.deleteById(pedidoId);
            logger.info("Pedido eliminado exitosamente");
            
        } catch (Exception e) {
            logger.error("Error al eliminar pedido {}: {}", pedidoId, e.getMessage(), e);
            throw new RuntimeException("Error al eliminar el pedido", e);
        }
    }

    public List<Pedido> obtenerPedidosPorEstado(String estado) {
        try {
            logger.debug("Obteniendo pedidos con estado: {}", estado);
            List<Pedido> pedidos = pedidoRepository.findByEstado(estado);
            logger.debug("Se encontraron {} pedidos con estado {}", pedidos.size(), estado);
            return pedidos;
        } catch (Exception e) {
            logger.error("Error al obtener pedidos por estado {}: {}", estado, e.getMessage(), e);
            throw new RuntimeException("Error al obtener pedidos por estado", e);
        }
    }

    private void cambiarEstadoMesa(String nombreMesa, Mesa.EstadoMesa nuevoEstado) {
        try {
            Mesa mesa = mesaRepository.findByNombre(nombreMesa);
            if (mesa != null) {
                mesa.setEstado(nuevoEstado);
                mesaRepository.save(mesa);
                logger.info("Estado de mesa {} cambiado a: {}", nombreMesa, nuevoEstado);
            } else {
                logger.warn("Mesa no encontrada: {}", nombreMesa);
            }
        } catch (Exception e) {
            logger.error("Error al cambiar estado de mesa {}: {}", nombreMesa, e.getMessage(), e);
        }
    }
}

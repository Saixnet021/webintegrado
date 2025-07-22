package com.puntomarisco.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.puntomarisco.backend.model.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Buscar pedidos por estado
    List<Pedido> findByEstado(String estado);
    
    // Buscar pedidos por mesa
    List<Pedido> findByMesa(String mesa);
    
    // Buscar pedidos por mesa que no han sido facturados
    List<Pedido> findByMesaAndFacturadoFalse(String mesa);
    
    // Buscar pedidos no facturados
    List<Pedido> findByFacturadoFalse();
    
    // Buscar pedidos por rango de fechas
    List<Pedido> findByHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    
    // Buscar pedidos por estado ordenados por hora
    @Query("SELECT p FROM Pedido p WHERE p.estado = :estado ORDER BY p.hora DESC")
    List<Pedido> findByEstadoOrderByHoraDesc(@Param("estado") String estado);
    
    // Buscar pedidos pendientes (útil para la cocina)
    @Query("SELECT p FROM Pedido p WHERE p.estado = 'PENDIENTE' ORDER BY p.hora ASC")
    List<Pedido> findPedidosPendientes();
    
    // Buscar pedidos activos (no facturados) ordenados por hora
    @Query("SELECT p FROM Pedido p WHERE p.facturado = false ORDER BY p.hora ASC")
    List<Pedido> findPedidosActivos();
}

    

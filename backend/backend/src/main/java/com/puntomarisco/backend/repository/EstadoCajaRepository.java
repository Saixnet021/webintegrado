package com.puntomarisco.backend.repository;

import com.puntomarisco.backend.model.EstadoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstadoCajaRepository extends JpaRepository<EstadoCaja, Long> {
    
    @Query("SELECT e FROM EstadoCaja e WHERE DATE(e.fecha) = DATE(:fecha)")
    Optional<EstadoCaja> findByFecha(@Param("fecha") LocalDateTime fecha);
    
    @Query("SELECT e FROM EstadoCaja e WHERE e.abierta = true ORDER BY e.fecha DESC")
    Optional<EstadoCaja> findCajaAbierta();
    
    @Query("SELECT e FROM EstadoCaja e WHERE DATE(e.fecha) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin) ORDER BY e.fecha DESC")
    List<EstadoCaja> findByFechaBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT e FROM EstadoCaja e ORDER BY e.fecha DESC")
    List<EstadoCaja> findAllOrderByFechaDesc();
}

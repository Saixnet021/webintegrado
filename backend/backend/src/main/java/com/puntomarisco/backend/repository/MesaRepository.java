package com.puntomarisco.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.puntomarisco.backend.model.Mesa;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
    
    // Buscar mesa por nombre
    Mesa findByNombre(String nombre);
    
    // Buscar mesas por estado
    List<Mesa> findByEstado(Mesa.EstadoMesa estado);
    
    // Buscar mesas libres
    List<Mesa> findByEstadoOrderByNombre(Mesa.EstadoMesa estado);
}


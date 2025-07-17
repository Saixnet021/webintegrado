package com.puntomarisco.backend.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.puntomarisco.backend.model.Plato;

public interface PlatoRepository extends JpaRepository<Plato, Long> {
}

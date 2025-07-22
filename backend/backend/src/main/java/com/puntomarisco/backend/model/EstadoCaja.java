package com.puntomarisco.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Data
public class EstadoCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDateTime fecha;
    private Boolean abierta = true;
    private LocalDateTime horaApertura;
    private LocalDateTime horaCierre;
    private Double totalVentas = 0.0;
    private String observaciones;
    
    // Constructor para nueva caja
    public EstadoCaja() {
        this.fecha = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        this.horaApertura = LocalDateTime.now();
        this.abierta = true;
    }
    
    public void cerrarCaja(String observaciones) {
        this.abierta = false;
        this.horaCierre = LocalDateTime.now();
        this.observaciones = observaciones;
    }
}

package com.puntomarisco.backend.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Data
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; // ej: "Mesa 1", "Barra", "Terraza"
    
    @Enumerated(EnumType.STRING)
    private EstadoMesa estado = EstadoMesa.LIBRE;
    
    public enum EstadoMesa {
        LIBRE,
        OCUPADA,
        RESERVADA
    }

    // getters y setters
}

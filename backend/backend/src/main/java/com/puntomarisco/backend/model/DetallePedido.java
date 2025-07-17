package com.puntomarisco.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;

@Entity
@Data
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String plato; // Ej: "Ceviche", "Chicharrón", etc.
    private Integer cantidad = 1;
    private Double precio;
    private String notas; // Ej: "sin cebolla", puede ser null o vacío si no hay notas
    
    @Enumerated(EnumType.STRING)
    private EstadoDetalle estado = EstadoDetalle.NORMAL;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    @JsonBackReference
    private Pedido pedido;
    
    public enum EstadoDetalle {
        NORMAL,
        EDITADO,
        AGREGADO,
        CANCELADO
    }
}

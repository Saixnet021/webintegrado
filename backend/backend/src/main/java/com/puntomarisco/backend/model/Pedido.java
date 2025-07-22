package com.puntomarisco.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;

@Entity
@Data
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mesa;
    
    @Enumerated(EnumType.STRING)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;
    
    private LocalDateTime hora;
    private Double total;
    private Boolean facturado = false;
    
    // Nuevo campo para método de pago
    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;
    
    // Nuevo campo para URL del QR
    private String qrUrl;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DetallePedido> detalles;
    
    public enum EstadoPedido {
        PENDIENTE,
        EN_PROCESO,
        LISTO,
        ENTREGADO,
        FACTURADO,
        CANCELADO
    }
    
    public enum MetodoPago {
        EFECTIVO,
        YAPE,
        VISA
    }
}

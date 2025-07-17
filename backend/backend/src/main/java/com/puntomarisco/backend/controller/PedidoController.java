package com.puntomarisco.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.puntomarisco.backend.model.Pedido;
import com.puntomarisco.backend.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public Pedido crearPedido(@RequestBody Pedido pedido) {
        return pedidoService.guardarPedidoConDetalles(pedido);
    }

    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoService.obtenerPedidos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.obtenerPorId(id);
        if (pedido != null) {
            return ResponseEntity.ok(pedido);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/mesa/{mesa}")
    public List<Pedido> obtenerPedidosPorMesa(@PathVariable String mesa) {
        return pedidoService.obtenerPorMesa(mesa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> actualizarPedido(@PathVariable Long id, @RequestBody Pedido pedido) {
        Pedido pedidoActualizado = pedidoService.actualizarPedido(id, pedido);
        if (pedidoActualizado != null) {
            return ResponseEntity.ok(pedidoActualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/facturar")
    public ResponseEntity<Pedido> facturarPedido(@PathVariable Long id) {
        Pedido pedidoFacturado = pedidoService.facturarPedido(id);
        if (pedidoFacturado != null) {
            return ResponseEntity.ok(pedidoFacturado);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        Pedido pedidoActualizado = pedidoService.actualizarEstadoPedido(id, estado);
        if (pedidoActualizado != null) {
            return ResponseEntity.ok(pedidoActualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        try {
            pedidoService.eliminarPedido(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/activos")
    public List<Pedido> obtenerPedidosActivos() {
        return pedidoService.obtenerPedidos().stream()
                .filter(p -> !p.getFacturado())
                .toList();
    }

    // WebSocket endpoint para recibir pedidos y enviarlos a todos los suscriptores
    @MessageMapping("/pedido")
    @SendTo("/topic/pedidos")
    public Pedido enviarPedido(Pedido pedido) {
        return pedidoService.guardarPedidoConDetalles(pedido);
    }
}

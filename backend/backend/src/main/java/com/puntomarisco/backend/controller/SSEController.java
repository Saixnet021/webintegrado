package com.puntomarisco.backend.controller;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puntomarisco.backend.model.Pedido;

@RestController
@RequestMapping("/api/sse")
@CrossOrigin(origins = "*")
public class SSEController {

    private static final Logger logger = LoggerFactory.getLogger(SSEController.class);
    
    // Lista thread-safe para mantener todas las conexiones SSE activas
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping(value = "/pedidos", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPedidos() {
        // Crear un nuevo SseEmitter con timeout de 30 minutos
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        
        // Agregar el emitter a la lista
        emitters.add(emitter);
        logger.info("✅ Nueva conexión SSE establecida. Total conexiones: {}", emitters.size());
        
        // Configurar callbacks para limpiar cuando se cierre la conexión
        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            logger.info("🔌 Conexión SSE completada. Total conexiones: {}", emitters.size());
        });
        
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            logger.info("⏰ Conexión SSE timeout. Total conexiones: {}", emitters.size());
        });
        
        emitter.onError((ex) -> {
            emitters.remove(emitter);
            logger.error("❌ Error en conexión SSE: {}", ex.getMessage());
        });
        
        try {
            // Enviar mensaje inicial de conexión
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("Conexión SSE establecida exitosamente"));
        } catch (IOException e) {
            logger.error("Error enviando mensaje inicial SSE: {}", e.getMessage());
            emitters.remove(emitter);
        }
        
        return emitter;
    }
    
    /**
     * Método para enviar un nuevo pedido a todas las conexiones SSE activas
     */
    public void enviarNuevoPedido(Pedido pedido) {
        if (emitters.isEmpty()) {
            logger.info("📡 No hay conexiones SSE activas para enviar el pedido");
            return;
        }
        
        logger.info("📤 Enviando pedido a {} conexiones SSE", emitters.size());
        
        // Lista para remover emitters que fallen
        CopyOnWriteArrayList<SseEmitter> emittersToRemove = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                String pedidoJson = objectMapper.writeValueAsString(pedido);
                emitter.send(SseEmitter.event()
                    .name("nuevo-pedido")
                    .data(pedidoJson));
                logger.debug("✅ Pedido enviado exitosamente via SSE");
            } catch (IOException e) {
                logger.error("❌ Error enviando pedido via SSE: {}", e.getMessage());
                emittersToRemove.add(emitter);
            }
        }
        
        // Remover emitters que fallaron
        emitters.removeAll(emittersToRemove);
        
        if (!emittersToRemove.isEmpty()) {
            logger.info("🧹 Removidas {} conexiones SSE fallidas", emittersToRemove.size());
        }
    }
    
    /**
     * Método para obtener el número de conexiones activas
     */
    public int getActiveConnections() {
        return emitters.size();
    }
}

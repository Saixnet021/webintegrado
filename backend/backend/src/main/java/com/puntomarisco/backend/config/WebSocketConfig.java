package com.puntomarisco.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Bean
    public TaskScheduler heartBeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("wss-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitar un broker simple en memoria para enviar mensajes a clientes suscritos
        config.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[]{10000, 10000}) // Heartbeat cada 10 segundos
                .setTaskScheduler(heartBeatScheduler()); // Usar el TaskScheduler personalizado
        
        // Prefijo para mensajes que van al servidor
        config.setApplicationDestinationPrefixes("/app");
        
        // Configurar el prefijo para mensajes de usuario específico
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registrar endpoint WebSocket con SockJS como fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permitir todos los orígenes para desarrollo
                .setHandshakeHandler(new DefaultHandshakeHandler())
                .withSockJS()
                .setHeartbeatTime(25000) // Heartbeat de SockJS cada 25 segundos
                .setDisconnectDelay(5000) // Delay antes de considerar desconexión
                .setStreamBytesLimit(128 * 1024) // Límite de bytes por stream
                .setHttpMessageCacheSize(1000) // Tamaño del cache de mensajes HTTP
                .setSessionCookieNeeded(false) // No requerir cookies de sesión
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"); // URL de SockJS
        
        // Endpoint adicional sin SockJS para conexiones WebSocket nativas
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*") // Permitir todos los orígenes para desarrollo
                .setHandshakeHandler(new DefaultHandshakeHandler());
    }
}

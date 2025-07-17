import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.subscribers = new Set();
    this.messageHandlers = new Set();
    this.errorHandlers = new Set();
    this.connectionStatusHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Empezar con 1 segundo
    this.maxReconnectDelay = 30000; // Máximo 30 segundos
    this.subscription = null;
    
    // Detectar la URL base automáticamente
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    // Simplificar la detección de URL para ser más confiable
    const hostname = window.location.hostname;
    
    // Para desarrollo local, siempre usar localhost:8080
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    
    // Para producción, usar el mismo protocolo y host
    const protocol = window.location.protocol;
    const port = window.location.port;
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  addErrorHandler(handler) {
    this.errorHandlers.add(handler);
  }

  removeErrorHandler(handler) {
    this.errorHandlers.delete(handler);
  }

  addConnectionStatusHandler(handler) {
    this.connectionStatusHandlers.add(handler);
  }

  removeConnectionStatusHandler(handler) {
    this.connectionStatusHandlers.delete(handler);
  }

  notifyConnectionStatus(status) {
    this.connectionStatusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error en handler de estado de conexión:', error);
      }
    });
  }

  notifyMessage(message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error en handler de mensaje:', error);
      }
    });
  }

  notifyError(error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('Error en handler de error:', error);
      }
    });
  }

  connect() {
    // Si ya está conectado o conectando, no hacer nada
    if (this.connected || this.connecting) {
      console.log('🔄 WebSocket ya está conectado o conectando');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.connecting = true;
      this.notifyConnectionStatus('Conectando...');

      // Limpiar cliente anterior completamente
      this.cleanup();

      const wsUrl = `${this.baseUrl}/ws`;
      console.log(`🔗 Intentando conectar a: ${wsUrl}`);

      // Crear nuevo cliente STOMP con SockJS
      this.client = new Client({
        webSocketFactory: () => {
          try {
            const sockjs = new SockJS(wsUrl);
            console.log('🔗 SockJS creado exitosamente');
            return sockjs;
          } catch (error) {
            console.error('❌ Error creando SockJS:', error);
            throw error;
          }
        },
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug: ' + str);
        },
        reconnectDelay: 0, // Manejamos la reconexión manualmente
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        forceBinaryWSFrames: false, // Cambiar a false para mejor compatibilidad
        appendMissingNULLonIncoming: true,
      });

      // Configurar callbacks
      this.client.onConnect = (frame) => {
        console.log('✅ Conectado a WebSocket exitosamente');
        console.log('Frame de conexión:', frame);
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Resetear delay
        this.notifyConnectionStatus('Conectado');
        
        // Suscribirse al topic de pedidos
        try {
          this.subscription = this.client.subscribe('/topic/pedidos', (message) => {
            console.log('📨 Mensaje recibido:', message.body);
            try {
              const pedido = JSON.parse(message.body);
              this.notifyMessage(pedido);
            } catch (parseError) {
              console.error('Error al parsear mensaje:', parseError);
              this.notifyError(parseError);
            }
          });
          console.log('✅ Suscripción exitosa a /topic/pedidos');
          resolve();
        } catch (subscribeError) {
          console.error('❌ Error al suscribirse:', subscribeError);
          this.notifyError(subscribeError);
          reject(subscribeError);
        }
      };

      this.client.onStompError = (frame) => {
        console.error('❌ Error en STOMP:', frame.headers['message']);
        console.error('Detalles del error:', frame.body);
        this.connected = false;
        this.connecting = false;
        this.notifyConnectionStatus('Conexión fallida');
        const error = new Error(`STOMP Error: ${frame.headers['message'] || 'Error desconocido'}`);
        this.notifyError(error);
        reject(error);
      };

      this.client.onWebSocketError = (error) => {
        console.error('❌ Error en WebSocket:', error);
        this.connected = false;
        this.connecting = false;
        this.notifyConnectionStatus('Conexión fallida');
        this.notifyError(error);
        reject(error);
      };

      this.client.onWebSocketClose = (event) => {
        console.log('🔌 WebSocket cerrado:', event);
        this.connected = false;
        this.connecting = false;
        
        // Solo programar reconexión si no fue una desconexión manual
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.notifyConnectionStatus('Desconectado');
          this.scheduleReconnect();
        } else {
          this.notifyConnectionStatus('Conexión fallida');
        }
      };

      this.client.onDisconnect = () => {
        console.log('🔌 Desconectado de WebSocket');
        this.connected = false;
        this.connecting = false;
        this.notifyConnectionStatus('Desconectado');
      };

      // Activar la conexión con timeout
      console.log('🔄 Iniciando conexión WebSocket...');
      try {
        this.client.activate();
        
        // Timeout para la conexión
        setTimeout(() => {
          if (this.connecting && !this.connected) {
            console.error('❌ Timeout de conexión WebSocket');
            this.connecting = false;
            this.notifyConnectionStatus('Conexión fallida');
            const timeoutError = new Error('Timeout de conexión WebSocket');
            this.notifyError(timeoutError);
            reject(timeoutError);
          }
        }, 10000); // 10 segundos de timeout
        
      } catch (activateError) {
        console.error('❌ Error al activar cliente:', activateError);
        this.connecting = false;
        this.notifyConnectionStatus('Conexión fallida');
        this.notifyError(activateError);
        reject(activateError);
      }
    });
  }

  cleanup() {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
        this.subscription = null;
        console.log('🧹 Suscripción limpiada');
      } catch (error) {
        console.warn('Advertencia al limpiar suscripción:', error);
      }
    }
    
    if (this.client) {
      try {
        this.client.deactivate();
        console.log('🧹 Cliente desactivado');
      } catch (error) {
        console.warn('Advertencia al desactivar cliente:', error);
      }
      this.client = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      this.notifyConnectionStatus('Conexión fallida');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.notifyConnectionStatus(`Reintentando... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.connected && !this.connecting) {
        this.connect().catch(error => {
          console.error('Error en reconexión:', error);
        });
      }
    }, delay);
  }

  disconnect() {
    console.log('🔌 Desconectando WebSocket manualmente...');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión automática
    
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
        this.subscription = null;
      } catch (error) {
        console.warn('Error al desuscribirse:', error);
      }
    }
    
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (error) {
        console.warn('Error al desactivar cliente:', error);
      }
    }
    
    this.connected = false;
    this.connecting = false;
    this.notifyConnectionStatus('Desconectado');
    console.log('🔌 WebSocket desconectado manualmente');
  }

  sendMessage(destination, message) {
    if (this.client && this.connected) {
      try {
        this.client.publish({
          destination: destination,
          body: JSON.stringify(message)
        });
        console.log('📤 Mensaje enviado a:', destination);
        return true;
      } catch (error) {
        console.error('❌ Error al enviar mensaje:', error);
        this.notifyError(error);
        return false;
      }
    } else {
      console.error('❌ WebSocket no está conectado');
      return false;
    }
  }

  isConnected() {
    return this.connected && this.client && this.client.connected;
  }

  getConnectionStatus() {
    if (this.connected) return 'Conectado';
    if (this.connecting) return 'Conectando...';
    if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
      return `Reintentando... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`;
    }
    return 'Desconectado';
  }

  // Método para forzar reconexión manual
  forceReconnect() {
    console.log('🔄 Forzando reconexión manual...');
    this.reconnectAttempts = 0;
    this.connected = false;
    this.connecting = false;
    
    // Limpiar completamente
    this.cleanup();
    
    // Reconectar después de un breve delay
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Error en reconexión forzada:', error);
        this.notifyConnectionStatus('Conexión fallida');
      });
    }, 1000);
  }
}

// Exportar una instancia singleton
export default new WebSocketService();

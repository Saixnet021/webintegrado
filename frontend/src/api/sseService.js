class SSEService {
  constructor() {
    this.eventSource = null;
    this.connected = false;
    this.connecting = false;
    this.messageHandlers = new Set();
    this.errorHandlers = new Set();
    this.connectionStatusHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Empezar con 1 segundo
    this.maxReconnectDelay = 30000; // Máximo 30 segundos
    
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
      console.log('🔄 SSE ya está conectado o conectando');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.connecting = true;
      this.notifyConnectionStatus('Conectando...');

      // Limpiar conexión anterior si existe
      this.cleanup();

      const sseUrl = `${this.baseUrl}/api/sse/pedidos`;
      console.log(`🔗 Intentando conectar SSE a: ${sseUrl}`);

      try {
        // Crear nueva conexión EventSource
        this.eventSource = new EventSource(sseUrl);

        // Configurar event listeners
        this.eventSource.onopen = (event) => {
          console.log('✅ Conexión SSE establecida exitosamente');
          this.connected = true;
          this.connecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000; // Resetear delay
          this.notifyConnectionStatus('Conectado');
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          console.log('📨 Mensaje SSE recibido:', event.data);
          try {
            const data = JSON.parse(event.data);
            this.notifyMessage(data);
          } catch (parseError) {
            console.error('Error al parsear mensaje SSE:', parseError);
            this.notifyError(parseError);
          }
        };

        // Listener específico para eventos de conexión
        this.eventSource.addEventListener('connected', (event) => {
          console.log('✅ Evento de conexión SSE:', event.data);
        });

        // Listener específico para nuevos pedidos
        this.eventSource.addEventListener('nuevo-pedido', (event) => {
          console.log('📨 Nuevo pedido recibido via SSE:', event.data);
          try {
            const pedido = JSON.parse(event.data);
            this.notifyMessage(pedido);
          } catch (parseError) {
            console.error('Error al parsear pedido SSE:', parseError);
            this.notifyError(parseError);
          }
        });

        this.eventSource.onerror = (event) => {
          console.error('❌ Error en conexión SSE:', event);
          this.connected = false;
          this.connecting = false;
          
          // Determinar el tipo de error
          if (this.eventSource.readyState === EventSource.CLOSED) {
            console.log('🔌 Conexión SSE cerrada por el servidor');
            this.notifyConnectionStatus('Desconectado');
            this.scheduleReconnect();
          } else if (this.eventSource.readyState === EventSource.CONNECTING) {
            console.log('🔄 SSE intentando reconectar...');
            this.notifyConnectionStatus('Reconectando...');
          } else {
            console.error('❌ Error desconocido en SSE');
            this.notifyConnectionStatus('Conexión fallida');
            const error = new Error('Error de conexión SSE');
            this.notifyError(error);
            reject(error);
          }
        };

        // Timeout para la conexión inicial
        setTimeout(() => {
          if (this.connecting && !this.connected) {
            console.error('❌ Timeout de conexión SSE');
            this.connecting = false;
            this.notifyConnectionStatus('Conexión fallida');
            const timeoutError = new Error('Timeout de conexión SSE');
            this.notifyError(timeoutError);
            reject(timeoutError);
          }
        }, 10000); // 10 segundos de timeout

      } catch (error) {
        console.error('❌ Error al crear conexión SSE:', error);
        this.connecting = false;
        this.notifyConnectionStatus('Conexión fallida');
        this.notifyError(error);
        reject(error);
      }
    });
  }

  cleanup() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
        console.log('🧹 Conexión SSE cerrada');
      } catch (error) {
        console.warn('Advertencia al cerrar SSE:', error);
      }
      this.eventSource = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de intentos de reconexión SSE alcanzado');
      this.notifyConnectionStatus('Conexión fallida');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`🔄 Reintentando conexión SSE en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.notifyConnectionStatus(`Reintentando... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.connected && !this.connecting) {
        this.connect().catch(error => {
          console.error('Error en reconexión SSE:', error);
        });
      }
    }, delay);
  }

  disconnect() {
    console.log('🔌 Desconectando SSE manualmente...');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión automática
    
    this.cleanup();
    
    this.connected = false;
    this.connecting = false;
    this.notifyConnectionStatus('Desconectado');
    console.log('🔌 SSE desconectado manualmente');
  }

  isConnected() {
    return this.connected && this.eventSource && this.eventSource.readyState === EventSource.OPEN;
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
    console.log('🔄 Forzando reconexión SSE manual...');
    this.reconnectAttempts = 0;
    this.connected = false;
    this.connecting = false;
    
    // Limpiar completamente
    this.cleanup();
    
    // Reconectar después de un breve delay
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Error en reconexión SSE forzada:', error);
        this.notifyConnectionStatus('Conexión fallida');
      });
    }, 1000);
  }
}

// Exportar una instancia singleton
export default new SSEService();

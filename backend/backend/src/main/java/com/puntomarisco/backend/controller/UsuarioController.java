package com.puntomarisco.backend.controller;

import com.puntomarisco.backend.model.Usuario;
import com.puntomarisco.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);
    
    @Autowired
    private UsuarioService usuarioService;
    
    /**
     * Endpoint para autenticación de usuarios
     * POST /api/usuarios/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciales) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = credenciales.get("email");
            String password = credenciales.get("password");
            
            // Validar que se proporcionen las credenciales
            if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email y contraseña son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Autenticar usuario
            Usuario usuario = usuarioService.autenticarUsuario(email, password);
            
            if (usuario != null) {
                // Login exitoso - crear respuesta sin incluir la contraseña
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", usuario.getId());
                userData.put("email", usuario.getEmail());
                userData.put("nombre", usuario.getNombre());
                userData.put("rol", usuario.getRol().getValor());
                userData.put("activo", usuario.getActivo());
                userData.put("ultimoAcceso", usuario.getUltimoAcceso());
                
                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("usuario", userData);
                
                logger.info("Login exitoso para usuario: {}", email);
                return ResponseEntity.ok(response);
            } else {
                // Login fallido
                response.put("success", false);
                response.put("message", "Credenciales incorrectas");
                
                logger.warn("Intento de login fallido para: {}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error durante login", e);
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Obtener todos los usuarios
     * GET /api/usuarios
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerUsuarios() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodosLosUsuarios();
            
            // Crear lista sin contraseñas
            List<Map<String, Object>> usuariosSinPassword = usuarios.stream()
                .map(this::convertirUsuarioAMap)
                .toList();
            
            response.put("success", true);
            response.put("usuarios", usuariosSinPassword);
            response.put("total", usuariosSinPassword.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al obtener usuarios", e);
            response.put("success", false);
            response.put("message", "Error al obtener usuarios");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Obtener usuario por ID
     * GET /api/usuarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerUsuarioPorId(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
            
            if (usuarioOpt.isPresent()) {
                response.put("success", true);
                response.put("usuario", convertirUsuarioAMap(usuarioOpt.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error al obtener usuario por ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Error al obtener usuario");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Crear nuevo usuario
     * POST /api/usuarios
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearUsuario(@Valid @RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Usuario usuarioCreado = usuarioService.crearUsuario(usuario);
            
            response.put("success", true);
            response.put("message", "Usuario creado exitosamente");
            response.put("usuario", convertirUsuarioAMap(usuarioCreado));
            
            logger.info("Usuario creado: {}", usuarioCreado.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Error de validación al crear usuario: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            logger.error("Error al crear usuario", e);
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Actualizar usuario existente
     * PUT /api/usuarios/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarUsuario(
            @PathVariable Long id, 
            @RequestBody Usuario datosActualizacion) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, datosActualizacion);
            
            response.put("success", true);
            response.put("message", "Usuario actualizado exitosamente");
            response.put("usuario", convertirUsuarioAMap(usuarioActualizado));
            
            logger.info("Usuario actualizado: {}", usuarioActualizado.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Error de validación al actualizar usuario: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            logger.error("Error al actualizar usuario con ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Cambiar estado de usuario (activar/desactivar)
     * PATCH /api/usuarios/{id}/estado
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstadoUsuario(
            @PathVariable Long id, 
            @RequestBody Map<String, Boolean> estado) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Boolean activo = estado.get("activo");
            if (activo == null) {
                response.put("success", false);
                response.put("message", "El campo 'activo' es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }
            
            usuarioService.cambiarEstadoUsuario(id, activo);
            
            response.put("success", true);
            response.put("message", "Estado de usuario actualizado exitosamente");
            
            logger.info("Estado de usuario cambiado - ID: {}, Activo: {}", id, activo);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Error al cambiar estado de usuario: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            logger.error("Error al cambiar estado de usuario con ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Eliminar usuario (eliminación lógica)
     * DELETE /api/usuarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarUsuario(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            usuarioService.eliminarUsuario(id);
            
            response.put("success", true);
            response.put("message", "Usuario eliminado exitosamente");
            
            logger.info("Usuario eliminado - ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Error al eliminar usuario: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            logger.error("Error al eliminar usuario con ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Convertir Usuario a Map sin incluir la contraseña
     * @param usuario Usuario a convertir
     * @return Map con datos del usuario sin contraseña
     */
    private Map<String, Object> convertirUsuarioAMap(Usuario usuario) {
        Map<String, Object> usuarioMap = new HashMap<>();
        usuarioMap.put("id", usuario.getId());
        usuarioMap.put("email", usuario.getEmail());
        usuarioMap.put("nombre", usuario.getNombre());
        usuarioMap.put("rol", usuario.getRol().getValor());
        usuarioMap.put("activo", usuario.getActivo());
        usuarioMap.put("fechaCreacion", usuario.getFechaCreacion());
        usuarioMap.put("fechaActualizacion", usuario.getFechaActualizacion());
        usuarioMap.put("ultimoAcceso", usuario.getUltimoAcceso());
        return usuarioMap;
    }
}

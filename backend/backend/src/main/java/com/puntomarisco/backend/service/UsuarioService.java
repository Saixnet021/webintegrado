package com.puntomarisco.backend.service;

import com.puntomarisco.backend.model.Usuario;
import com.puntomarisco.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {
    
    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    
    /**
     * Autenticar usuario con email y contraseña
     * @param email Email del usuario
     * @param password Contraseña en texto plano
     * @return Usuario si las credenciales son válidas, null en caso contrario
     */
    public Usuario autenticarUsuario(String email, String password) {
        try {
            // Validar parámetros de entrada
            if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                logger.warn("Intento de login con credenciales vacías");
                return null;
            }
            
            // Buscar usuario por email
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndActivoTrue(email.trim().toLowerCase());
            
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                
                // Verificar contraseña
                if (passwordEncoder.matches(password, usuario.getPassword())) {
                    // Actualizar último acceso
                    actualizarUltimoAcceso(usuario.getId());
                    logger.info("Login exitoso para usuario: {}", email);
                    return usuario;
                } else {
                    logger.warn("Contraseña incorrecta para usuario: {}", email);
                }
            } else {
                logger.warn("Usuario no encontrado o inactivo: {}", email);
            }
            
            return null;
        } catch (Exception e) {
            logger.error("Error durante autenticación para usuario: {}", email, e);
            return null;
        }
    }
    
    /**
     * Crear nuevo usuario
     * @param usuario Datos del usuario
     * @return Usuario creado
     * @throws IllegalArgumentException Si los datos son inválidos
     */
    public Usuario crearUsuario(Usuario usuario) {
        try {
            // Validaciones de seguridad
            validarDatosUsuario(usuario);
            
            // Verificar que el email no exista
            if (usuarioRepository.existsByEmail(usuario.getEmail().trim().toLowerCase())) {
                throw new IllegalArgumentException("Ya existe un usuario con el email: " + usuario.getEmail());
            }
            
            // Preparar usuario para guardar
            usuario.setEmail(usuario.getEmail().trim().toLowerCase());
            usuario.setNombre(usuario.getNombre().trim());
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            usuario.setActivo(true);
            usuario.setFechaCreacion(LocalDateTime.now());
            
            Usuario usuarioGuardado = usuarioRepository.save(usuario);
            logger.info("Usuario creado exitosamente: {}", usuarioGuardado.getEmail());
            
            return usuarioGuardado;
        } catch (Exception e) {
            logger.error("Error al crear usuario: {}", usuario.getEmail(), e);
            throw e;
        }
    }
    
    /**
     * Actualizar usuario existente
     * @param id ID del usuario
     * @param datosActualizacion Datos a actualizar
     * @return Usuario actualizado
     * @throws IllegalArgumentException Si los datos son inválidos
     */
    public Usuario actualizarUsuario(Long id, Usuario datosActualizacion) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
            
            if (usuarioOpt.isEmpty()) {
                throw new IllegalArgumentException("Usuario no encontrado con ID: " + id);
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Actualizar nombre si se proporciona
            if (datosActualizacion.getNombre() != null && !datosActualizacion.getNombre().trim().isEmpty()) {
                if (datosActualizacion.getNombre().trim().length() < 2 || datosActualizacion.getNombre().trim().length() > 100) {
                    throw new IllegalArgumentException("El nombre debe tener entre 2 y 100 caracteres");
                }
                usuario.setNombre(datosActualizacion.getNombre().trim());
            }
            
            // Actualizar rol si se proporciona
            if (datosActualizacion.getRol() != null) {
                usuario.setRol(datosActualizacion.getRol());
            }
            
            // Actualizar contraseña si se proporciona
            if (datosActualizacion.getPassword() != null && !datosActualizacion.getPassword().trim().isEmpty()) {
                if (datosActualizacion.getPassword().length() < 6) {
                    throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
                }
                usuario.setPassword(passwordEncoder.encode(datosActualizacion.getPassword()));
            }
            
            usuario.setFechaActualizacion(LocalDateTime.now());
            
            Usuario usuarioActualizado = usuarioRepository.save(usuario);
            logger.info("Usuario actualizado exitosamente: {}", usuarioActualizado.getEmail());
            
            return usuarioActualizado;
        } catch (Exception e) {
            logger.error("Error al actualizar usuario con ID: {}", id, e);
            throw e;
        }
    }
    
    /**
     * Obtener todos los usuarios activos
     * @return Lista de usuarios activos
     */
    @Transactional(readOnly = true)
    public List<Usuario> obtenerTodosLosUsuarios() {
        try {
            return usuarioRepository.findAllActiveUsers();
        } catch (Exception e) {
            logger.error("Error al obtener usuarios", e);
            throw new RuntimeException("Error al obtener usuarios", e);
        }
    }
    
    /**
     * Obtener usuario por ID
     * @param id ID del usuario
     * @return Usuario si existe
     */
    @Transactional(readOnly = true)
    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        try {
            return usuarioRepository.findById(id);
        } catch (Exception e) {
            logger.error("Error al obtener usuario por ID: {}", id, e);
            return Optional.empty();
        }
    }
    
    /**
     * Activar/desactivar usuario
     * @param id ID del usuario
     * @param activo Estado activo
     */
    public void cambiarEstadoUsuario(Long id, Boolean activo) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
            
            if (usuarioOpt.isEmpty()) {
                throw new IllegalArgumentException("Usuario no encontrado con ID: " + id);
            }
            
            Usuario usuario = usuarioOpt.get();
            usuario.setActivo(activo);
            usuario.setFechaActualizacion(LocalDateTime.now());
            
            usuarioRepository.save(usuario);
            logger.info("Estado de usuario cambiado - ID: {}, Activo: {}", id, activo);
        } catch (Exception e) {
            logger.error("Error al cambiar estado de usuario - ID: {}", id, e);
            throw e;
        }
    }
    
    /**
     * Eliminar usuario (eliminación lógica)
     * @param id ID del usuario
     */
    public void eliminarUsuario(Long id) {
        try {
            cambiarEstadoUsuario(id, false);
            logger.info("Usuario eliminado (desactivado) - ID: {}", id);
        } catch (Exception e) {
            logger.error("Error al eliminar usuario - ID: {}", id, e);
            throw e;
        }
    }
    
    /**
     * Actualizar último acceso del usuario
     * @param id ID del usuario
     */
    private void actualizarUltimoAcceso(Long id) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                usuario.setUltimoAcceso(LocalDateTime.now());
                usuarioRepository.save(usuario);
            }
        } catch (Exception e) {
            logger.warn("Error al actualizar último acceso para usuario ID: {}", id, e);
            // No lanzar excepción para no interrumpir el login
        }
    }
    
    /**
     * Validar datos del usuario
     * @param usuario Usuario a validar
     * @throws IllegalArgumentException Si los datos son inválidos
     */
    private void validarDatosUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("Los datos del usuario no pueden ser nulos");
        }
        
        // Validar email
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        
        String email = usuario.getEmail().trim();
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("El formato del email no es válido");
        }
        
        // Validar nombre
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        
        if (usuario.getNombre().trim().length() < 2 || usuario.getNombre().trim().length() > 100) {
            throw new IllegalArgumentException("El nombre debe tener entre 2 y 100 caracteres");
        }
        
        // Validar contraseña
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        
        if (usuario.getPassword().length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        
        // Validar rol
        if (usuario.getRol() == null) {
            usuario.setRol(Usuario.RolUsuario.MESERO); // Rol por defecto
        }
    }
    
    /**
     * Inicializar usuarios por defecto si no existen
     */
    @Transactional
    public void inicializarUsuariosPorDefecto() {
        try {
            // Verificar si ya existen usuarios
            long cantidadUsuarios = usuarioRepository.count();
            
            if (cantidadUsuarios == 0) {
                logger.info("Inicializando usuarios por defecto...");
                
                // Crear usuario administrador
                Usuario admin = new Usuario();
                admin.setEmail("admin@puntomarisco.com");
                admin.setPassword("admin123");
                admin.setNombre("Administrador");
                admin.setRol(Usuario.RolUsuario.ADMIN);
                crearUsuario(admin);
                
                // Crear usuario gerente
                Usuario gerente = new Usuario();
                gerente.setEmail("gerente@puntomarisco.com");
                gerente.setPassword("gerente123");
                gerente.setNombre("Gerente");
                gerente.setRol(Usuario.RolUsuario.ADMIN);
                crearUsuario(gerente);
                
                // Crear meseros
                Usuario mesero1 = new Usuario();
                mesero1.setEmail("mesero1@puntomarisco.com");
                mesero1.setPassword("mesero123");
                mesero1.setNombre("Mesero Juan");
                mesero1.setRol(Usuario.RolUsuario.MESERO);
                crearUsuario(mesero1);
                
                Usuario mesero2 = new Usuario();
                mesero2.setEmail("mesero2@puntomarisco.com");
                mesero2.setPassword("mesero123");
                mesero2.setNombre("Mesero María");
                mesero2.setRol(Usuario.RolUsuario.MESERO);
                crearUsuario(mesero2);
                
                logger.info("Usuarios por defecto creados exitosamente");
            }
        } catch (Exception e) {
            logger.error("Error al inicializar usuarios por defecto", e);
        }
    }
}

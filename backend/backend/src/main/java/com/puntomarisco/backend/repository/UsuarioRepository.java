package com.puntomarisco.backend.repository;

import com.puntomarisco.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Buscar usuario por email (para login)
     * Usa parámetros nombrados para prevenir inyección SQL
     */
    @Query("SELECT u FROM Usuario u WHERE u.email = :email AND u.activo = true")
    Optional<Usuario> findByEmailAndActivoTrue(@Param("email") String email);
    
    /**
     * Verificar si existe un usuario con el email dado
     */
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Verificar si existe un usuario con el email dado, excluyendo un ID específico
     * (útil para actualizaciones)
     */
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email AND u.id != :id")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("id") Long id);
    
    /**
     * Obtener todos los usuarios activos
     */
    @Query("SELECT u FROM Usuario u WHERE u.activo = true ORDER BY u.fechaCreacion DESC")
    List<Usuario> findAllActiveUsers();
    
    /**
     * Obtener usuarios por rol
     */
    @Query("SELECT u FROM Usuario u WHERE u.rol = :rol AND u.activo = true ORDER BY u.nombre ASC")
    List<Usuario> findByRolAndActivoTrue(@Param("rol") Usuario.RolUsuario rol);
    
    /**
     * Buscar usuarios por nombre (búsqueda parcial)
     */
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND u.activo = true")
    List<Usuario> findByNombreContainingIgnoreCaseAndActivoTrue(@Param("nombre") String nombre);
    
    /**
     * Actualizar último acceso del usuario
     */
    @Query("UPDATE Usuario u SET u.ultimoAcceso = :fechaAcceso WHERE u.id = :id")
    void updateUltimoAcceso(@Param("id") Long id, @Param("fechaAcceso") LocalDateTime fechaAcceso);
    
    /**
     * Contar usuarios por rol
     */
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.rol = :rol AND u.activo = true")
    long countByRolAndActivoTrue(@Param("rol") Usuario.RolUsuario rol);
    
    /**
     * Obtener usuarios creados en un rango de fechas
     */
    @Query("SELECT u FROM Usuario u WHERE u.fechaCreacion BETWEEN :fechaInicio AND :fechaFin ORDER BY u.fechaCreacion DESC")
    List<Usuario> findByFechaCreacionBetween(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                           @Param("fechaFin") LocalDateTime fechaFin);
    
    /**
     * Activar/desactivar usuario
     */
    @Query("UPDATE Usuario u SET u.activo = :activo, u.fechaActualizacion = :fechaActualizacion WHERE u.id = :id")
    void updateActivoById(@Param("id") Long id, @Param("activo") Boolean activo, @Param("fechaActualizacion") LocalDateTime fechaActualizacion);
}

package com.puntomarisco.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    @Email(message = "Email debe tener un formato válido")
    @NotBlank(message = "Email es obligatorio")
    private String email;
    
    @Column(nullable = false)
    @NotBlank(message = "Contraseña es obligatoria")
    @Size(min = 6, message = "Contraseña debe tener al menos 6 caracteres")
    private String password;
    
    @Column(nullable = false)
    @NotBlank(message = "Nombre es obligatorio")
    @Size(min = 2, max = 100, message = "Nombre debe tener entre 2 y 100 caracteres")
    private String nombre;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol = RolUsuario.MESERO;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;
    
    // Enum para roles
    public enum RolUsuario {
        ADMIN("admin"),
        MESERO("mesero");
        
        private final String valor;
        
        RolUsuario(String valor) {
            this.valor = valor;
        }
        
        public String getValor() {
            return valor;
        }
    }
    
    // Constructor por defecto
    public Usuario() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Constructor con parámetros
    public Usuario(String email, String password, String nombre, RolUsuario rol) {
        this();
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.rol = rol;
    }
    
    // Métodos de ciclo de vida JPA
    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public RolUsuario getRol() {
        return rol;
    }
    
    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
    
    public LocalDateTime getUltimoAcceso() {
        return ultimoAcceso;
    }
    
    public void setUltimoAcceso(LocalDateTime ultimoAcceso) {
        this.ultimoAcceso = ultimoAcceso;
    }
    
    // Métodos de utilidad
    public boolean isAdmin() {
        return RolUsuario.ADMIN.equals(this.rol);
    }
    
    public boolean isMesero() {
        return RolUsuario.MESERO.equals(this.rol);
    }
    
    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", nombre='" + nombre + '\'' +
                ", rol=" + rol +
                ", activo=" + activo +
                ", fechaCreacion=" + fechaCreacion +
                '}';
    }
}

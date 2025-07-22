package com.puntomarisco.backend.service;

import com.puntomarisco.backend.model.EstadoCaja;
import com.puntomarisco.backend.repository.EstadoCajaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EstadoCajaService {
    
    private static final Logger logger = LoggerFactory.getLogger(EstadoCajaService.class);
    
    @Autowired
    private EstadoCajaRepository estadoCajaRepository;
    
    public EstadoCaja obtenerCajaActual() {
        LocalDateTime hoy = LocalDateTime.now();
        Optional<EstadoCaja> cajaHoy = estadoCajaRepository.findByFecha(hoy);
        
        if (cajaHoy.isPresent()) {
            return cajaHoy.get();
        } else {
            // Crear nueva caja para el día
            EstadoCaja nuevaCaja = new EstadoCaja();
            logger.info("Creando nueva caja para el día: {}", hoy.toLocalDate());
            return estadoCajaRepository.save(nuevaCaja);
        }
    }
    
    public boolean isCajaAbierta() {
        EstadoCaja cajaActual = obtenerCajaActual();
        return cajaActual.getAbierta();
    }
    
    public EstadoCaja cerrarCaja(String observaciones, Double totalVentas) {
        EstadoCaja cajaActual = obtenerCajaActual();
        
        if (!cajaActual.getAbierta()) {
            throw new RuntimeException("La caja ya está cerrada");
        }
        
        cajaActual.setTotalVentas(totalVentas);
        cajaActual.cerrarCaja(observaciones);
        
        logger.info("Caja cerrada para el día: {} con total: S/ {}", 
                   cajaActual.getFecha().toLocalDate(), totalVentas);
        
        return estadoCajaRepository.save(cajaActual);
    }
    
    public EstadoCaja abrirCaja() {
        EstadoCaja cajaActual = obtenerCajaActual();
        
        if (cajaActual.getAbierta()) {
            throw new RuntimeException("La caja ya está abierta");
        }
        
        cajaActual.setAbierta(true);
        cajaActual.setHoraApertura(LocalDateTime.now());
        cajaActual.setHoraCierre(null);
        cajaActual.setObservaciones(null);
        
        logger.info("Caja reabierta para el día: {}", cajaActual.getFecha().toLocalDate());
        
        return estadoCajaRepository.save(cajaActual);
    }
    
    public List<EstadoCaja> obtenerHistorialCajas() {
        return estadoCajaRepository.findAllOrderByFechaDesc();
    }
    
    public List<EstadoCaja> obtenerCajasPorRango(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return estadoCajaRepository.findByFechaBetween(fechaInicio, fechaFin);
    }
    
    public EstadoCaja obtenerCajaPorFecha(LocalDateTime fecha) {
        return estadoCajaRepository.findByFecha(fecha).orElse(null);
    }
}

package com.puntomarisco.backend.controller;

import com.puntomarisco.backend.model.EstadoCaja;
import com.puntomarisco.backend.service.EstadoCajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/caja")
@CrossOrigin(origins = "*")
public class EstadoCajaController {
    
    @Autowired
    private EstadoCajaService estadoCajaService;
    
    @GetMapping("/estado")
    public ResponseEntity<EstadoCaja> obtenerEstadoCaja() {
        EstadoCaja caja = estadoCajaService.obtenerCajaActual();
        return ResponseEntity.ok(caja);
    }
    
    @GetMapping("/abierta")
    public ResponseEntity<Boolean> isCajaAbierta() {
        boolean abierta = estadoCajaService.isCajaAbierta();
        return ResponseEntity.ok(abierta);
    }
    
    @PostMapping("/cerrar")
    public ResponseEntity<EstadoCaja> cerrarCaja(@RequestBody Map<String, Object> request) {
        try {
            String observaciones = (String) request.get("observaciones");
            Double totalVentas = Double.valueOf(request.get("totalVentas").toString());
            
            EstadoCaja cajaCerrada = estadoCajaService.cerrarCaja(observaciones, totalVentas);
            return ResponseEntity.ok(cajaCerrada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/abrir")
    public ResponseEntity<EstadoCaja> abrirCaja() {
        try {
            EstadoCaja cajaAbierta = estadoCajaService.abrirCaja();
            return ResponseEntity.ok(cajaAbierta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/historial")
    public ResponseEntity<List<EstadoCaja>> obtenerHistorial() {
        List<EstadoCaja> historial = estadoCajaService.obtenerHistorialCajas();
        return ResponseEntity.ok(historial);
    }
    
    @GetMapping("/rango")
    public ResponseEntity<List<EstadoCaja>> obtenerCajasPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        List<EstadoCaja> cajas = estadoCajaService.obtenerCajasPorRango(fechaInicio, fechaFin);
        return ResponseEntity.ok(cajas);
    }
    
    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<EstadoCaja> obtenerCajaPorFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fecha) {
        EstadoCaja caja = estadoCajaService.obtenerCajaPorFecha(fecha);
        if (caja != null) {
            return ResponseEntity.ok(caja);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

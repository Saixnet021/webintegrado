package com.puntomarisco.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.puntomarisco.backend.model.Mesa;
import com.puntomarisco.backend.service.MesaService;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaService mesaService;

    @GetMapping
    public List<Mesa> listarMesas() {
        return mesaService.obtenerTodasLasMesas();
    }

    @PostMapping
    public Mesa crearMesa(@RequestBody Mesa mesa) {
        return mesaService.crearMesa(mesa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mesa> renombrarMesa(@PathVariable Long id, @RequestBody Mesa datos) {
        return mesaService.renombrarMesa(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMesa(@PathVariable Long id) {
        return mesaService.eliminarMesa(id);
    }
}

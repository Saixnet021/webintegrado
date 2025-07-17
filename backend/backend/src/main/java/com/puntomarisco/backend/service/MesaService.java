package com.puntomarisco.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.puntomarisco.backend.model.Mesa;
import com.puntomarisco.backend.repository.MesaRepository;

@Service
public class MesaService {

    @Autowired
    private MesaRepository mesaRepo;

    public List<Mesa> obtenerTodasLasMesas() {
        return mesaRepo.findAll();
    }

    public Mesa crearMesa(Mesa mesa) {
        return mesaRepo.save(mesa);
    }

    public ResponseEntity<Mesa> renombrarMesa(Long id, Mesa datos) {
        return mesaRepo.findById(id).map(mesa -> {
            mesa.setNombre(datos.getNombre());
            mesaRepo.save(mesa);
            return ResponseEntity.ok(mesa);
        }).orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<Void> eliminarMesa(Long id) {
        if (mesaRepo.existsById(id)) {
            mesaRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

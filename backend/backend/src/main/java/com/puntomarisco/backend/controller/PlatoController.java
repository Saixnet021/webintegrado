package com.puntomarisco.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.puntomarisco.backend.model.Plato;
import com.puntomarisco.backend.repository.PlatoRepository;

@RestController
@RequestMapping("/api/platos")
@CrossOrigin(origins = "*")
public class PlatoController {

    @Autowired
    private PlatoRepository platoRepository;

    @GetMapping
    public List<Plato> listarPlatos() {
        return platoRepository.findAll();
    }
}

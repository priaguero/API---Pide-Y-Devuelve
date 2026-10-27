package pide.devuelve.api.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pide.devuelve.api.IService.IPrestamoService;
import pide.devuelve.api.entidades.Prestamo;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {
    @Autowired
    private IPrestamoService prestamoService;

    @GetMapping
    public List<Prestamo> getAllPrestamos() {
        return prestamoService.findAllPrestamos();
    }

    @PostMapping
    public Prestamo createPrestamo(@RequestBody Prestamo prestamo) {
        return prestamoService.savePrestamo(prestamo);
    }

    @PutMapping("/{id}")
    public Prestamo updatePrestamo(@PathVariable int id, @RequestBody Prestamo prestamo) {
        prestamo.setId(id);
        return prestamoService.savePrestamo(prestamo);
    }
}
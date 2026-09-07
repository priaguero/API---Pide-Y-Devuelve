package pide.devuelve.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pide.devuelve.IService.IPrestamoService;
import pide.devuelve.entidades.Prestamo;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {
    @Autowired
    private IPrestamoService prestamoService;

    @GetMapping("/prestamos")
    public List<Prestamo> getAllPrestamos() {
        return prestamoService.findAllPrestamos();
    }

    @PostMapping("/prestamos")
    public Prestamo createPrestamo(@RequestBody Prestamo prestamo) {
        return prestamoService.savePrestamo(prestamo);
    }
    
}

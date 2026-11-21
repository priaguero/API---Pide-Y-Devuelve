package pide.devuelve.api.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pide.devuelve.api.IService.IPrestamoService;
import pide.devuelve.api.entidades.Prestamo;
import pide.devuelve.api.entidades.Usuario;
import pide.devuelve.api.service.SesionService;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {
    @Autowired
    private IPrestamoService prestamoService;

    @Autowired
    private SesionService sesionService;

    public record SolicitudPrestamo(int recursoId, String observaciones) {}

    public record DatosDevolucion(Prestamo.EstadoPrestamo estado, String observaciones) {}

    @GetMapping
    public List<Prestamo> getAllPrestamos(@RequestHeader(value = "Authorization", required = false) String autorizacion) {
        sesionService.exigirAdministrador(autorizacion);
        return prestamoService.findAllPrestamos();
    }

    @GetMapping("/mios")
    public List<Prestamo> getMisPrestamos(@RequestHeader(value = "Authorization", required = false) String autorizacion) {
        Usuario usuario = sesionService.usuarioActual(autorizacion);
        return prestamoService.findPrestamosDeUsuario(usuario.getId());
    }

    @PostMapping("/solicitar")
    public Prestamo solicitar(@RequestHeader(value = "Authorization", required = false) String autorizacion,
                              @RequestBody SolicitudPrestamo solicitud) {
        Usuario usuario = sesionService.usuarioActual(autorizacion);
        return prestamoService.solicitarPrestamo(usuario, solicitud.recursoId(), solicitud.observaciones());
    }

    @PostMapping("/{id}/devolver")
    public Prestamo devolver(@RequestHeader(value = "Authorization", required = false) String autorizacion,
                             @PathVariable int id, @RequestBody DatosDevolucion datos) {
        sesionService.exigirAdministrador(autorizacion);
        return prestamoService.registrarDevolucion(id, datos.estado(), datos.observaciones());
    }
}
package pide.devuelve.api.service;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pide.devuelve.api.IService.IPrestamoService;
import pide.devuelve.api.entidades.Prestamo;
import pide.devuelve.api.entidades.Recurso;
import pide.devuelve.api.entidades.Usuario;
import pide.devuelve.api.repository.PrestamoRepository;
import pide.devuelve.api.repository.RecursoRepository;

@Service
public class PrestamoService implements IPrestamoService {
    @Autowired
    private PrestamoRepository pRepository;

    @Autowired
    private RecursoRepository rRepository;

    public List<Prestamo> findAllPrestamos() {
        return pRepository.findAll();
    }

    public List<Prestamo> findPrestamosDeUsuario(int usuarioId) {
        return pRepository.findByUsuarioIdOrderByIdDesc(usuarioId);
    }
    
    @Transactional
    public Prestamo solicitarPrestamo(Usuario usuario, int recursoId, String observaciones) {
        Recurso recurso = rRepository.buscarConBloqueo(recursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El recurso no existe"));

        if (recurso.getEstado() != Recurso.EstadoRecurso.DISPONIBLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese recurso ya no está disponible");
        }

        recurso.setEstado(Recurso.EstadoRecurso.NO_DISPONIBLE);
        rRepository.save(recurso);

        Prestamo prestamo = new Prestamo();
        prestamo.setUsuario(usuario);
        prestamo.setRecurso(recurso);
        prestamo.setFechaInicio(LocalDate.now());
        prestamo.setEstado(recurso.getCondicion());
        prestamo.setObservaciones(observaciones);
        return pRepository.save(prestamo);
    }

    @Transactional
    public Prestamo registrarDevolucion(int prestamoId, Prestamo.EstadoPrestamo estado, String observaciones) {
        if (estado == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indicá en qué estado vuelve el recurso");
        }
        Prestamo prestamo = pRepository.findById(prestamoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El préstamo no existe"));

        if (prestamo.getFechaDevolucion() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese préstamo ya fue devuelto");
        }

        String textoObservaciones = observaciones;
        if (textoObservaciones == null || textoObservaciones.trim().isEmpty()) {
            textoObservaciones = "Sin observaciones";
        }

        prestamo.setFechaDevolucion(LocalDate.now());
        prestamo.setEstado(estado);
        prestamo.setObservaciones(textoObservaciones);

        Recurso recurso = prestamo.getRecurso();
        recurso.setEstado(Recurso.EstadoRecurso.DISPONIBLE);
        recurso.setCondicion(estado);
        recurso.setObservaciones(textoObservaciones);
        rRepository.save(recurso);

        return pRepository.save(prestamo);
    }
}

package pide.devuelve.api.IService;
import java.util.List;
import pide.devuelve.api.entidades.Prestamo;
import pide.devuelve.api.entidades.Usuario;

public interface IPrestamoService {
    List<Prestamo> findAllPrestamos();
    List<Prestamo> findPrestamosDeUsuario(int usuarioId);
    Prestamo solicitarPrestamo(Usuario usuario, int recursoId, String observaciones);
    Prestamo registrarDevolucion(int prestamoId, Prestamo.EstadoPrestamo estado, String observaciones);
}

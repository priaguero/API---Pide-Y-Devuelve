package pide.devuelve.api.IService;
import java.util.List;
import pide.devuelve.api.entidades.Prestamo;

public interface IPrestamoService {
    List<Prestamo> findAllPrestamos();
    Prestamo savePrestamo(Prestamo prestamo);
}
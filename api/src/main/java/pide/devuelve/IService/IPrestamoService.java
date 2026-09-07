package pide.devuelve.IService;
import java.util.List;
import pide.devuelve.entidades.Prestamo;

public interface IPrestamoService {
    List<Prestamo> findAllPrestamos();
    Prestamo savePrestamo(Prestamo prestamo);
}
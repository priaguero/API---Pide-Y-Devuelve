package pide.devuelve.service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pide.devuelve.IService.IPrestamoService;
import pide.devuelve.entidades.Prestamo;
import pide.devuelve.repository.PrestamoRepository;

@Service
public class PrestamoService implements IPrestamoService {
    @Autowired
    private PrestamoRepository pRepository;

    public List<Prestamo> findAllPrestamos() {
        return pRepository.findAll();
    }
    public Prestamo savePrestamo (Prestamo prestamo) {
        return pRepository.save(prestamo);
    } 
}
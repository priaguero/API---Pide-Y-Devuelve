package pide.devuelve.api.service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pide.devuelve.api.IService.IPrestamoService;
import pide.devuelve.api.entidades.Prestamo;
import pide.devuelve.api.repository.PrestamoRepository;

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
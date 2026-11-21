package pide.devuelve.api.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.api.entidades.Prestamo;

public interface PrestamoRepository extends JpaRepository<Prestamo, Integer> {
    List<Prestamo> findByUsuarioIdOrderByIdDesc(int usuarioId);
}

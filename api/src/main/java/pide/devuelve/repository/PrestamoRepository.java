package pide.devuelve.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.entidades.Prestamo;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
}

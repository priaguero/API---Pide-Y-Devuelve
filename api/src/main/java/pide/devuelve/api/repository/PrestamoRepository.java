package pide.devuelve.api.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.api.entidades.Prestamo;

public interface PrestamoRepository extends JpaRepository<Prestamo, Integer> {
}

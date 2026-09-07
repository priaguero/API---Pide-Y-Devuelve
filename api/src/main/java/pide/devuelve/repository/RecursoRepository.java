package pide.devuelve.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.entidades.Recurso;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {
}

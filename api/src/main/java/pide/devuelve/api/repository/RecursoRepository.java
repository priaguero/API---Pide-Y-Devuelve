package pide.devuelve.api.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.api.entidades.Recurso;

public interface RecursoRepository extends JpaRepository<Recurso, Integer> {
}

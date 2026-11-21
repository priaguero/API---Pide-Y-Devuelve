package pide.devuelve.api.repository;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pide.devuelve.api.entidades.Recurso;

public interface RecursoRepository extends JpaRepository<Recurso, Integer> {

    long countByCodigoStartingWith(String prefijo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Recurso r where r.id = :id")
    Optional<Recurso> buscarConBloqueo(@Param("id") int id);
}

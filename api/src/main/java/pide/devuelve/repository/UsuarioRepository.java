package pide.devuelve.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.entidades.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}

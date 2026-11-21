package pide.devuelve.api.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.api.entidades.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByTipo(Usuario.TipoUsuario tipo);
}

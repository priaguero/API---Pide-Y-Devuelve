package pide.devuelve.api.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import pide.devuelve.api.entidades.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
}

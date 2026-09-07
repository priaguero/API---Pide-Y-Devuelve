package pide.devuelve.IService;
import java.util.List;
import pide.devuelve.entidades.Usuario;

public interface IUsuarioService {
    List<Usuario> findAllUsuarios();
    Usuario saveUsuario(Usuario usuario);
}
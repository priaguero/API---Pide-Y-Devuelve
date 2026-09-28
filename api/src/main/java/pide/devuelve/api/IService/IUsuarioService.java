package pide.devuelve.api.IService;
import java.util.List;
import pide.devuelve.api.entidades.Usuario;

public interface IUsuarioService {
    List<Usuario> findAllUsuarios();
    Usuario saveUsuario(Usuario usuario);
}
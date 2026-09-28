package pide.devuelve.api.service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pide.devuelve.api.IService.IUsuarioService;
import pide.devuelve.api.entidades.Usuario;
import pide.devuelve.api.repository.UsuarioRepository;

@Service
public class UsuarioService implements IUsuarioService {
    @Autowired
    private UsuarioRepository uRepository;

    public List<Usuario> findAllUsuarios() {
        return uRepository.findAll();
    }
    public Usuario saveUsuario (Usuario usuario) {
        return uRepository.save(usuario);
    } 
}

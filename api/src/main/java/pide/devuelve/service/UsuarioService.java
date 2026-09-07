package pide.devuelve.service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pide.devuelve.IService.IUsuarioService;
import pide.devuelve.entidades.Usuario;
import pide.devuelve.repository.UsuarioRepository;

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

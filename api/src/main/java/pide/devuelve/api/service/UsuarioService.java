package pide.devuelve.api.service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
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

    public Usuario registrarUsuario(Usuario usuario) {
        if (esVacio(usuario.getNombre()) || esVacio(usuario.getApellido())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresá nombre y apellido completos");
        }
        if (usuario.getDNI() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresá un DNI válido");
        }
        if (usuario.getTipo() == null || usuario.getTipo() == Usuario.TipoUsuario.ADMINISTRADOR) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elegí un rol válido");
        }
        if (usuario.getTipo() == Usuario.TipoUsuario.ALUMNO && esVacio(usuario.getCurso())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los estudiantes tienen que indicar su curso");
        }
        if (esVacio(usuario.getEmail()) || !usuario.getEmail().contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresá un email válido");
        }
        if (usuario.getPassword() == null || usuario.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener al menos 6 caracteres");
        }

        String email = usuario.getEmail().trim().toLowerCase();
        if (uRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese email");
        }

        usuario.setId(0);
        usuario.setNombre(usuario.getNombre().trim());
        usuario.setApellido(usuario.getApellido().trim());
        if (usuario.getCurso() != null) {
            usuario.setCurso(usuario.getCurso().trim());
        }
        usuario.setEmail(email);
        usuario.setPassword(ClaveUtil.encriptar(usuario.getPassword()));
        usuario.setActivo(true);
        return uRepository.save(usuario);
    }

    public Usuario autenticar(String email, String password) {
        Usuario usuario = null;
        if (email != null) {
            usuario = uRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        }
        if (usuario == null || !usuario.isActivo() || !ClaveUtil.verificar(password, usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
        }
        return usuario;
    }

    private boolean esVacio(String texto) {
        return texto == null || texto.trim().isEmpty();
    }
}

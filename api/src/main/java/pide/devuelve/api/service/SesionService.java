package pide.devuelve.api.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pide.devuelve.api.entidades.Usuario;
import pide.devuelve.api.repository.UsuarioRepository;

@Service
public class SesionService {

    private final Map<String, Integer> sesiones = new ConcurrentHashMap<>();

    @Autowired
    private UsuarioRepository uRepository;

    public String iniciarSesion(Usuario usuario) {
        String token = UUID.randomUUID().toString();
        sesiones.put(token, usuario.getId());
        return token;
    }

    public void cerrarSesion(String cabecera) {
        String token = extraerToken(cabecera);
        if (token != null) {
            sesiones.remove(token);
        }
    }

    public Usuario usuarioActual(String cabecera) {
        String token = extraerToken(cabecera);
        if (token == null || !sesiones.containsKey(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenés que iniciar sesión");
        }
        Usuario usuario = uRepository.findById(sesiones.get(token)).orElse(null);
        if (usuario == null || !usuario.isActivo()) {
            sesiones.remove(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión ya no es válida");
        }
        return usuario;
    }

    public Usuario exigirAdministrador(String cabecera) {
        Usuario usuario = usuarioActual(cabecera);
        if (!usuario.esAdministrador()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso para hacer esto");
        }
        return usuario;
    }

    private String extraerToken(String cabecera) {
        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            return null;
        }
        return cabecera.substring(7).trim();
    }
}

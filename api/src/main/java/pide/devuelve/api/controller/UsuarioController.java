package pide.devuelve.api.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pide.devuelve.api.IService.IUsuarioService;
import pide.devuelve.api.entidades.Usuario;
import pide.devuelve.api.service.SesionService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    @Autowired
    private IUsuarioService usuarioService;

    @Autowired
    private SesionService sesionService;

    public record DatosLogin(String email, String password) {}

    public record RespuestaSesion(String token, Usuario usuario) {}

    @GetMapping
    public List<Usuario> getAllUsuarios(@RequestHeader(value = "Authorization", required = false) String autorizacion) {
        sesionService.exigirAdministrador(autorizacion);
        return usuarioService.findAllUsuarios();
    }

    @PostMapping("/registro")
    public RespuestaSesion registrar(@RequestBody Usuario usuario) {
        Usuario nuevo = usuarioService.registrarUsuario(usuario);
        return new RespuestaSesion(sesionService.iniciarSesion(nuevo), nuevo);
    }

    @PostMapping("/login")
    public RespuestaSesion iniciarSesion(@RequestBody DatosLogin datos) {
        Usuario usuario = usuarioService.autenticar(datos.email(), datos.password());
        return new RespuestaSesion(sesionService.iniciarSesion(usuario), usuario);
    }

    @PostMapping("/logout")
    public void cerrarSesion(@RequestHeader(value = "Authorization", required = false) String autorizacion) {
        sesionService.cerrarSesion(autorizacion);
    }

    @GetMapping("/me")
    public Usuario miPerfil(@RequestHeader(value = "Authorization", required = false) String autorizacion) {
        return sesionService.usuarioActual(autorizacion);
    }
}

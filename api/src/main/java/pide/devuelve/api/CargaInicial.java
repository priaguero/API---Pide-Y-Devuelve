package pide.devuelve.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import pide.devuelve.api.entidades.Recurso;
import pide.devuelve.api.entidades.Usuario;
import pide.devuelve.api.repository.RecursoRepository;
import pide.devuelve.api.repository.UsuarioRepository;
import pide.devuelve.api.service.ClaveUtil;

@Component
public class CargaInicial implements CommandLineRunner {

    private static final int UNIDADES_POR_LIBRO = 30;
    private static final int UNIDADES_CALCULADORAS = 10;
    private static final int UNIDADES_COMPUTADORAS = 40;

    @Autowired
    private RecursoRepository rRepository;

    @Autowired
    private UsuarioRepository uRepository;

    @Value("${app.administrador.email}")
    private String emailAdministrador;

    @Value("${app.administrador.password}")
    private String passwordAdministrador;

    @Override
    public void run(String... args) {
        crearAdministrador();
        crearRecursos(); 
    }

    private void crearAdministrador() {
        if (uRepository.existsByTipo(Usuario.TipoUsuario.ADMINISTRADOR)) {
            return;
        }
        Usuario administrador = new Usuario();
        administrador.setNombre("Administrador");
        administrador.setApellido("del Sistema");
        administrador.setDNI(1);
        administrador.setCurso("-");
        administrador.setEmail(emailAdministrador.trim().toLowerCase());
        administrador.setPassword(ClaveUtil.encriptar(passwordAdministrador));
        administrador.setActivo(true);
        administrador.setTipo(Usuario.TipoUsuario.ADMINISTRADOR);
        uRepository.save(administrador);
    }

    private void crearRecursos() {
        // Libros
        crearUnidades(UNIDADES_POR_LIBRO, "LIB-MET1", "Metro 1 - Student Book & Workbook",
                "Libro de inglés (Oxford), segunda edición, con Digital Pack.",
                "images/metro1.jpg", Recurso.TipoRecurso.LIBRO);
        crearUnidades(UNIDADES_POR_LIBRO, "LIB-MET2", "Metro 2 - Student Book & Workbook",
                "Libro de inglés (Oxford), con Digital Pack.",
                "images/metro2.jpg", Recurso.TipoRecurso.LIBRO);
        crearUnidades(UNIDADES_POR_LIBRO, "LIB-MET3", "Metro 3 - Student Book & Workbook",
                "Libro de inglés (Oxford), segunda edición, con Digital Pack.",
                "images/metro3.webp", Recurso.TipoRecurso.LIBRO);
        crearUnidades(UNIDADES_POR_LIBRO, "LIB-MFIE", "Martín Fierro",
                "Poema narrativo de José Hernández. Lectura obligatoria de Lengua y Literatura.",
                "images/martin-fierro.jpg", Recurso.TipoRecurso.LIBRO);
        crearUnidades(UNIDADES_POR_LIBRO, "LIB-FISI", "Física - Serie Nuevas Miradas",
                "Física para la educación secundaria (Tinta Fresca).",
                "images/cuad.fisica.jpg", Recurso.TipoRecurso.LIBRO);
        crearUnidades(UNIDADES_POR_LIBRO, "LIB-LYL2", "Lengua y Literatura II - Prácticas del lenguaje",
                "Manual de Lengua y Literatura II (Santillana).",
                "images/lenguayliteratura.webp", Recurso.TipoRecurso.LIBRO);

        // Equipos
        crearUnidades(UNIDADES_CALCULADORAS, "CAL", "Calculadora científica Solar",
                "Calculadora científica a energía solar.",
                "images/calculadora.png", Recurso.TipoRecurso.CALCULADORA);
        crearUnidades(UNIDADES_COMPUTADORAS, "COM", "Netbook Conectar Igualdad",
                "Computadora portátil del programa Conectar Igualdad.",
                "images/computadora.jpg", Recurso.TipoRecurso.COMPUTADORA);
    }

    private void crearUnidades(int cantidad, String prefijo, String nombre, String descripcion,
                               String imagen, Recurso.TipoRecurso tipo) {
        // Si ya existen unidades de este recurso, se sigue desde la siguiente
        int existentes = (int) rRepository.countByCodigoStartingWith(prefijo + "-");
        for (int i = existentes + 1; i <= cantidad; i++) {
            Recurso recurso = new Recurso();
            recurso.setNombre(nombre);
            recurso.setCodigo(prefijo + "-" + String.format("%03d", i));
            recurso.setDescripcion(descripcion);
            recurso.setImagen(imagen);
            recurso.setObservaciones("Sin observaciones");
            recurso.setTipo(tipo);
            recurso.setEstado(Recurso.EstadoRecurso.DISPONIBLE);
            rRepository.save(recurso);
        }
    }
}

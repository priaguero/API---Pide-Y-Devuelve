package pide.devuelve.api.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pide.devuelve.api.IService.IRecursoService;
import pide.devuelve.api.entidades.Recurso;
import pide.devuelve.api.service.SesionService;

@RestController
@RequestMapping("/api/recursos")
public class RecursoController {
    @Autowired
    private IRecursoService recursoService;

    @Autowired
    private SesionService sesionService;

    @GetMapping
    public List<Recurso> getAllRecursos() {
        return recursoService.findAllRecursos();
    }

    @PostMapping
    public Recurso createRecurso(@RequestHeader(value = "Authorization", required = false) String autorizacion,
                                 @RequestBody Recurso recurso) {
        sesionService.exigirAdministrador(autorizacion);
        return recursoService.saveRecurso(recurso);
    }

    @PutMapping("/{id}")
    public Recurso updateRecurso(@RequestHeader(value = "Authorization", required = false) String autorizacion,
                                 @PathVariable int id, @RequestBody Recurso recurso) {
        sesionService.exigirAdministrador(autorizacion);
        recurso.setId(id);
        return recursoService.saveRecurso(recurso);
    }
}

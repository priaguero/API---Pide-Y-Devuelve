package pide.devuelve.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pide.devuelve.IService.IRecursoService;
import pide.devuelve.entidades.Recurso;

@RestController
@RequestMapping("/api/recursos")
public class RecursoController {
    @Autowired
    private IRecursoService recursoService;

    @GetMapping
    public List<Recurso> getAllRecursos() {
        return recursoService.findAllRecursos();
    }

    @PostMapping
    public Recurso createRecurso(@RequestBody Recurso recurso) {
        return recursoService.saveRecurso(recurso);
    }
    
}

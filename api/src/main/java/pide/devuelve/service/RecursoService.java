package pide.devuelve.service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pide.devuelve.IService.IRecursoService;
import pide.devuelve.entidades.Recurso;
import pide.devuelve.repository.RecursoRepository;

@Service
public class RecursoService implements IRecursoService {
    @Autowired
    private RecursoRepository rRepository;

    public List<Recurso> findAllRecursos() {
        return rRepository.findAll();
    }
    public Recurso saveRecurso (Recurso recurso) {
        return rRepository.save(recurso);
    } 
} 

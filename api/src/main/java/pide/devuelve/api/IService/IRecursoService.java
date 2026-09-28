package pide.devuelve.api.IService;
import java.util.List;
import pide.devuelve.api.entidades.Recurso;

public interface IRecursoService {
    List<Recurso> findAllRecursos();
    Recurso saveRecurso(Recurso recurso);
}

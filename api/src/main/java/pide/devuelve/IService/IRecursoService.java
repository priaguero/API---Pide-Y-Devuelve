package pide.devuelve.IService;
import java.util.List;
import pide.devuelve.entidades.Recurso;

public interface IRecursoService {
    List<Recurso> findAllRecursos();
    Recurso saveRecurso(Recurso recurso);
}

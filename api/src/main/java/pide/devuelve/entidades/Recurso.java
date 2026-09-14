package pide.devuelve.entidades;
import jakarta.persistence.*;
import pide.devuelve.entidades.Recurso;
import java.util.List;

@Entity
@Table(name = "recursos")
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String nombre;
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoRecurso tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoRecurso estado;

    public enum TipoRecurso {
        COMPUTADORA,
        CALCULADORA,
        LIBRO
    }

    public enum EstadoRecurso {
        DISPONIBLE,
        NO_DISPONIBLE
    }


    @OneToMany(mappedBy = "recurso")
    private List<Prestamo> prestamos;

    public Recurso() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public TipoRecurso getTipo() {
        return tipo;
    }

    public void setTipo(TipoRecurso tipo) {
        this.tipo = tipo;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public EstadoRecurso getEstado() {
        return estado;
    }

    public void setEstado(EstadoRecurso estado) {
        this.estado = estado;
    }

}
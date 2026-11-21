package pide.devuelve.api.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "recursos")
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String nombre;
    private String codigo;
    private String descripcion;
    private String imagen;
    private String observaciones;

    @Enumerated(EnumType.STRING)
    private Prestamo.EstadoPrestamo condicion = Prestamo.EstadoPrestamo.BUENO;

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

    @JsonIgnore
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Prestamo.EstadoPrestamo getCondicion() {
        if (condicion == null) {
            return Prestamo.EstadoPrestamo.BUENO;
        }
        return condicion;
    }

    public void setCondicion(Prestamo.EstadoPrestamo condicion) {
        this.condicion = condicion;
    }

}
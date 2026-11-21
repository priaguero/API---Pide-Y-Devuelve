const URL_BASE = "/api";
const URL_USUARIOS = URL_BASE + "/usuarios";
const URL_RECURSOS = URL_BASE + "/recursos";
const URL_PRESTAMOS = URL_BASE + "/prestamos";

const ETIQUETAS_ROL = {
  ALUMNO: "Estudiante",
  DOCENTE: "Docente",
  PRECEPTOR: "Preceptor/a",
  DIRECTIVO: "Directivo/a",
  ADMINISTRADOR: "Administrador"
};

const ETIQUETAS_ESTADO = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DEFECTUOSO: "Defectuoso"
};

const ETIQUETAS_TIPO = {
  LIBRO: "Libro",
  CALCULADORA: "Calculadora",
  COMPUTADORA: "Computadora"
};

let token = null;
let usuarioActual = null;

let recursos = [];
let misPrestamos = [];
let todosLosPrestamos = [];
let socios = [];

let vistaActual = "recursos";
let filtroTipo = "todos";
let filtroPrestamos = "todos";
let textoBusqueda = "";

let gruposVisibles = [];      // grupos de recursos que se están mostrando (para los botones "Pedir")
let nombrePedidoPendiente = null; // recurso que quería pedir antes de iniciar sesión
let grupoAPedir = null;
let prestamoADevolver = null;
let temporizadorAviso = null;

// Funciones auxiliares
function escapar(texto) {
  if (texto === null || texto === undefined) {
    return "";
  }
  const contenedor = document.createElement("div");
  contenedor.textContent = String(texto);
  return contenedor.innerHTML.replace(/"/g, "&quot;");
}

function normalizar(texto) {
  if (texto === null || texto === undefined) {
    return "";
  }
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function nombreCompleto(usuario) {
  return usuario.nombre + " " + usuario.apellido;
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "-";
  }
  const partes = String(fecha).split("-");
  if (partes.length !== 3) {
    return fecha;
  }
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function esAdministrador() {
  if (usuarioActual === null) {
    return false;
  }
  if (usuarioActual.tipo === "ADMINISTRADOR") {
    return true;
  }
  return false;
}

function etiquetaRol(usuario) {
  let texto = ETIQUETAS_ROL[usuario.tipo];
  if (!texto) {
    texto = usuario.tipo;
  }
  return '<span class="etiqueta rol-' + escapar(usuario.tipo) + '">' + escapar(texto) + "</span>";
}

function textoEstado(estado) {
  const texto = ETIQUETAS_ESTADO[estado];
  if (!texto) {
    return estado;
  }
  return texto;
}

function insigniaEstado(estado) {
  return '<span class="insignia ' + escapar(estado) + '">' + escapar(textoEstado(estado)) + "</span>";
}

function puntajeCondicion(condicion) {
  if (condicion === "BUENO") {
    return 0;
  }
  if (condicion === "REGULAR") {
    return 1;
  }
  return 2;
}

function mostrarAviso(mensaje) {
  const aviso = document.getElementById("aviso");
  aviso.textContent = mensaje;
  aviso.classList.add("visible");
  if (temporizadorAviso !== null) {
    clearTimeout(temporizadorAviso);
  }
  temporizadorAviso = setTimeout(function () {
    aviso.classList.remove("visible");
  }, 3200);
}

function mostrarError(idElemento, mensaje) {
  const elemento = document.getElementById(idElemento);
  elemento.textContent = mensaje;
  elemento.hidden = false;
}

function ocultarError(idElemento) {
  document.getElementById(idElemento).hidden = true;
}

function abrirDialogo(idDialogo) {
  document.getElementById(idDialogo).showModal();
}

function cerrarDialogo(idDialogo) {
  document.getElementById(idDialogo).close();
}

// ====== COMUNICACIÓN CON LA API ======
async function pedirApi(url, opciones) {
  let metodo = "GET";
  let cuerpo = undefined;
  if (opciones) {
    if (opciones.metodo) {
      metodo = opciones.metodo;
    }
    if (opciones.cuerpo) {
      cuerpo = JSON.stringify(opciones.cuerpo);
    }
  }

  const cabeceras = { "Content-Type": "application/json" };
  if (token !== null) {
    cabeceras["Authorization"] = "Bearer " + token;
  }

  const respuesta = await fetch(url, { method: metodo, headers: cabeceras, body: cuerpo });
  const texto = await respuesta.text();

  if (!respuesta.ok) {
    let mensaje = "Ocurrió un error (" + respuesta.status + ")";
    try {
      const datos = JSON.parse(texto);
      if (datos.message) {
        mensaje = datos.message;
      }
    } catch (error) {
      // la respuesta no era JSON, dejamos el mensaje por defecto
    }
    // Si la sesión venció, limpiamos todo para que vuelva a iniciar sesión
    if (respuesta.status === 401 && token !== null) {
      limpiarSesion();
      actualizarInterfaz();
    }
    throw new Error(mensaje);
  }

  if (texto === "") {
    return null;
  }
  return JSON.parse(texto);
}

// sesión
function guardarSesion(nuevoToken, usuario) {
  token = nuevoToken;
  usuarioActual = usuario;
  localStorage.setItem("token", nuevoToken);
}

function limpiarSesion() {
  token = null;
  usuarioActual = null;
  misPrestamos = [];
  todosLosPrestamos = [];
  socios = [];
  localStorage.removeItem("token");
}

async function recuperarSesion() {
  const tokenGuardado = localStorage.getItem("token");
  if (tokenGuardado === null) {
    return;
  }
  token = tokenGuardado;
  try {
    usuarioActual = await pedirApi(URL_USUARIOS + "/me");
  } catch (error) {
    limpiarSesion();
  }
}

async function cerrarSesion() {
  try {
    await pedirApi(URL_USUARIOS + "/logout", { metodo: "POST" });
  } catch (error) {
    // si falla igual cerramos la sesión en este navegador
  }
  limpiarSesion();
  actualizarInterfaz();
  mostrarVista("recursos");
  mostrarAviso("Cerraste la sesión");
}

function renderZonaUsuario() {
  const zona = document.getElementById("zonaUsuario");

  if (usuarioActual === null) {
    zona.innerHTML =
      '<p class="invitacion">Iniciá sesión o registrate para pedir préstamos.</p>' +
      '<button type="button" class="btn" data-accion="abrir-ingresar">Iniciar sesión</button>' +
      '<button type="button" class="btn secundario" data-accion="abrir-registro">Registrarse</button>';
    return;
  }

  let lineaCurso = "";
  if (usuarioActual.tipo === "ALUMNO" && usuarioActual.curso) {
    lineaCurso = '<div class="usuario-curso">Curso: ' + escapar(usuarioActual.curso) + "</div>";
  }

  zona.innerHTML =
    '<div class="usuario-datos">' +
    '<svg class="avatar" aria-hidden="true"><use href="#icono-persona"/></svg>' +
    '<div class="usuario-texto">' +
    '<div class="usuario-nombre" title="' + escapar(nombreCompleto(usuarioActual)) + '">' + escapar(nombreCompleto(usuarioActual)) + "</div>" +
    etiquetaRol(usuarioActual) +
    lineaCurso +
    "</div></div>" +
    '<button type="button" class="btn secundario" data-accion="cerrar-sesion">Cerrar sesión</button>';
}

function actualizarInterfaz() {
  renderZonaUsuario();

  // Los botones "Préstamos" y "Socios" solo los ve quien administra los préstamos
  const botonesAdmin = document.querySelectorAll(".solo-admin");
  for (let i = 0; i < botonesAdmin.length; i++) {
    if (esAdministrador()) {
      botonesAdmin[i].hidden = false;
    } else {
      botonesAdmin[i].hidden = true;
    }
  }

  // Si estaba en una sección que ya no puede ver, vuelve a Recursos
  if ((vistaActual === "socios" || vistaActual === "prestamos") && !esAdministrador()) {
    mostrarVista("recursos");
  }
}

function mostrarVista(nombre) {
  if ((nombre === "socios" || nombre === "prestamos") && !esAdministrador()) {
    nombre = "recursos";
  }
  vistaActual = nombre;

  const botones = document.querySelectorAll(".item-menu");
  for (let i = 0; i < botones.length; i++) {
    if (botones[i].dataset.vista === nombre) {
      botones[i].classList.add("activo");
      botones[i].setAttribute("aria-current", "page");
    } else {
      botones[i].classList.remove("activo");
      botones[i].removeAttribute("aria-current");
    }
  }

  const vistas = document.querySelectorAll(".vista");
  for (let i = 0; i < vistas.length; i++) {
    if (vistas[i].id === "vista-" + nombre) {
      vistas[i].hidden = false;
    } else {
      vistas[i].hidden = true;
    }
  }

  if (nombre === "recursos") {
    cargarRecursos();
  } else if (nombre === "mis-prestamos") {
    cargarMisPrestamos();
  } else if (nombre === "prestamos") {
    cargarTodosLosPrestamos();
  } else if (nombre === "socios") {
    cargarSocios();
  }
}

function renderVistaActual() {
  if (vistaActual === "recursos") {
    renderRecursos();
  } else if (vistaActual === "mis-prestamos") {
    renderMisPrestamos();
  } else if (vistaActual === "prestamos") {
    renderPrestamosAdmin();
  } else if (vistaActual === "socios") {
    renderSocios();
  }
}

// Carga los recursos desde la API y los muestra en la interfaz. Si hay un error, se muestra un aviso.
async function cargarRecursos() {
  try {
    recursos = await pedirApi(URL_RECURSOS);
  } catch (error) {
    mostrarAviso("No se pudo conectar con la API");
  }
  renderRecursos();
}

async function cargarMisPrestamos() {
  if (usuarioActual === null) {
    renderMisPrestamos();
    return;
  }
  try {
    misPrestamos = await pedirApi(URL_PRESTAMOS + "/mios");
  } catch (error) {
    mostrarAviso(error.message);
  }
  renderMisPrestamos();
}

async function cargarTodosLosPrestamos() {
  if (!esAdministrador()) {
    return;
  }
  try {
    todosLosPrestamos = await pedirApi(URL_PRESTAMOS);
  } catch (error) {
    mostrarAviso(error.message);
  }
  renderPrestamosAdmin();
}

async function cargarSocios() {
  if (!esAdministrador()) {
    return;
  }
  try {
    socios = await pedirApi(URL_USUARIOS);
  } catch (error) {
    mostrarAviso(error.message);
  }
  renderSocios();
}

function agruparRecursos() {
  // Se agrupan las unidades iguales (ej: las 30 copias de un libro) en una sola tarjeta
  const grupos = new Map();

  for (let i = 0; i < recursos.length; i++) {
    const recurso = recursos[i];
    let grupo = grupos.get(recurso.nombre);

    if (grupo === undefined) {
      grupo = {
        nombre: recurso.nombre,
        descripcion: recurso.descripcion,
        imagen: recurso.imagen,
        tipo: recurso.tipo,
        total: 0,
        disponibles: 0,
        unidad: null
      };
      grupos.set(recurso.nombre, grupo);
    }

    grupo.total = grupo.total + 1;

    if (recurso.estado === "DISPONIBLE") {
      grupo.disponibles = grupo.disponibles + 1;
      // Se ofrece primero la unidad en mejor estado
      if (grupo.unidad === null) {
        grupo.unidad = recurso;
      } else if (puntajeCondicion(recurso.condicion) < puntajeCondicion(grupo.unidad.condicion)) {
        grupo.unidad = recurso;
      }
    }
  }

  return Array.from(grupos.values());
}

function renderRecursos() {
  const contenedor = document.getElementById("gridRecursos");
  const todos = agruparRecursos();
  const busqueda = normalizar(textoBusqueda);

  gruposVisibles = [];
  for (let i = 0; i < todos.length; i++) {
    const grupo = todos[i];

    if (filtroTipo !== "todos" && grupo.tipo !== filtroTipo) {
      continue;
    }
    if (busqueda !== "") {
      const textoGrupo = normalizar(grupo.nombre + " " + grupo.descripcion + " " + ETIQUETAS_TIPO[grupo.tipo]);
      if (!textoGrupo.includes(busqueda)) {
        continue;
      }
    }
    gruposVisibles.push(grupo);
  }

  if (gruposVisibles.length === 0) {
    contenedor.innerHTML = '<div class="vacio"><p>No hay recursos que coincidan con la búsqueda.</p></div>';
    return;
  }

  contenedor.innerHTML = gruposVisibles
    .map(function (grupo, indice) {
      let estadoUnidad = "-";
      let observacionUnidad = "-";
      let codigoUnidad = "-";
      let claseDisponibilidad = "no";
      let textoDisponibilidad = "No disponible";
      let botonPedir = '<button type="button" class="btn" disabled>Sin unidades disponibles</button>';

      if (grupo.unidad !== null) {
        estadoUnidad = textoEstado(grupo.unidad.condicion);
        observacionUnidad = grupo.unidad.observaciones;
        codigoUnidad = grupo.unidad.codigo;
        claseDisponibilidad = "si";
        textoDisponibilidad = "Disponible · " + grupo.disponibles + " de " + grupo.total;
        botonPedir = '<button type="button" class="btn" data-pedir="' + indice + '">Pedir préstamo</button>';
      }

      return (
        '<article class="tarjeta-recurso">' +
        '<div class="imagen-recurso"><img src="' + escapar(grupo.imagen) + '" alt="' + escapar(grupo.nombre) + '" loading="lazy"></div>' +
        '<div class="datos-recurso">' +
        "<h3>" + escapar(grupo.nombre) + "</h3>" +
        '<p class="descripcion">' + escapar(grupo.descripcion) + "</p>" +
        '<ul class="detalle">' +
        "<li><span>Estado: <strong>" + escapar(estadoUnidad) + "</strong></span></li>" +
        "<li><span>Observaciones: " + escapar(observacionUnidad) + "</span></li>" +
        "<li><span>Próxima unidad: " + escapar(codigoUnidad) + "</span></li>" +
        "</ul>" +
        '<span class="disponibilidad ' + claseDisponibilidad + '">' + escapar(textoDisponibilidad) + "</span>" +
        botonPedir +
        "</div></article>"
      );
    })
    .join("");
}

function renderMisPrestamos() {
  const contenedor = document.getElementById("listaMisPrestamos");

  if (usuarioActual === null) {
    contenedor.innerHTML =
      '<div class="vacio"><p>Para ver tus préstamos tenés que iniciar sesión o registrarte.</p>' +
      '<button type="button" class="btn" data-accion="abrir-ingresar">Iniciar sesión</button>' +
      '<button type="button" class="btn secundario" data-accion="abrir-registro">Registrarme</button></div>';
    return;
  }

  const busqueda = normalizar(textoBusqueda);
  const lista = [];
  for (let i = 0; i < misPrestamos.length; i++) {
    const prestamo = misPrestamos[i];
    if (busqueda !== "") {
      const textoPrestamo = normalizar(prestamo.recurso.nombre + " " + prestamo.recurso.codigo + " " + prestamo.observaciones);
      if (!textoPrestamo.includes(busqueda)) {
        continue;
      }
    }
    lista.push(prestamo);
  }

  if (lista.length === 0) {
    contenedor.innerHTML =
      '<div class="vacio"><p>Todavía no tenés préstamos para mostrar.</p>' +
      '<button type="button" class="btn" data-accion="ir-recursos">Ver recursos</button></div>';
    return;
  }

  contenedor.innerHTML = lista
    .map(function (prestamo) {
      let etiquetaSituacion = '<span class="insignia pendiente">Pendiente de devolución</span>';
      if (prestamo.fechaDevolucion) {
        etiquetaSituacion = '<span class="insignia devuelto">Devuelto</span>';
      }

      return (
        '<article class="prestamo">' +
        '<div class="prestamo-imagen"><img src="' + escapar(prestamo.recurso.imagen) + '" alt="' + escapar(prestamo.recurso.nombre) + '"></div>' +
        '<div class="prestamo-datos">' +
        "<h2>" + escapar(prestamo.recurso.nombre) + "<small>" + escapar(prestamo.recurso.codigo) + "</small></h2>" +
        '<dl class="campos">' +
        "<dt>Estado:</dt><dd>" + insigniaEstado(prestamo.estado) + "</dd>" +
        "<dt>Observaciones:</dt><dd>" + escapar(prestamo.observaciones) + "</dd>" +
        "<dt>Retiro:</dt><dd>" + escapar(formatearFecha(prestamo.fechaInicio)) + "</dd>" +
        "<dt>Devolución:</dt><dd>" + escapar(formatearFecha(prestamo.fechaDevolucion)) + "</dd>" +
        "<dt>Situación:</dt><dd>" + etiquetaSituacion + "</dd>" +
        "</dl></div></article>"
      );
    })
    .join("");
}

function renderPrestamosAdmin() {
  const cuerpo = document.getElementById("cuerpoPrestamos");
  const busqueda = normalizar(textoBusqueda);

  // Los más nuevos primero
  const ordenados = todosLosPrestamos.slice().sort(function (a, b) {
    return b.id - a.id;
  });

  const lista = [];
  for (let i = 0; i < ordenados.length; i++) {
    const prestamo = ordenados[i];

    if (filtroPrestamos === "pendientes" && prestamo.fechaDevolucion) {
      continue;
    }
    if (filtroPrestamos === "devueltos" && !prestamo.fechaDevolucion) {
      continue;
    }
    if (busqueda !== "") {
      const textoPrestamo = normalizar(
        nombreCompleto(prestamo.usuario) + " " + prestamo.usuario.curso + " " + prestamo.recurso.nombre + " " + prestamo.recurso.codigo
      );
      if (!textoPrestamo.includes(busqueda)) {
        continue;
      }
    }
    lista.push(prestamo);
  }

  if (lista.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="8">No hay préstamos para mostrar.</td></tr>';
    return;
  }

  cuerpo.innerHTML = lista
    .map(function (prestamo) {
      let celdaDevolucion = escapar(formatearFecha(prestamo.fechaDevolucion));
      let celdaAccion = "";
      if (!prestamo.fechaDevolucion) {
        celdaDevolucion = '<span class="insignia pendiente">Pendiente</span>';
        celdaAccion = '<button type="button" class="btn chico" data-devolver="' + prestamo.id + '">Registrar devolución</button>';
      }

      let detalleSocio = ETIQUETAS_ROL[prestamo.usuario.tipo];
      if (prestamo.usuario.tipo === "ALUMNO" && prestamo.usuario.curso) {
        detalleSocio = detalleSocio + " · " + prestamo.usuario.curso;
      }

      return (
        "<tr>" +
        "<td>" + prestamo.id + "</td>" +
        '<td class="celda-persona">' + escapar(nombreCompleto(prestamo.usuario)) + "<small>" + escapar(detalleSocio) + "</small></td>" +
        '<td class="celda-persona">' + escapar(prestamo.recurso.nombre) + "<small>" + escapar(prestamo.recurso.codigo) + "</small></td>" +
        "<td>" + escapar(formatearFecha(prestamo.fechaInicio)) + "</td>" +
        "<td>" + celdaDevolucion + "</td>" +
        "<td>" + insigniaEstado(prestamo.estado) + "</td>" +
        "<td>" + escapar(prestamo.observaciones) + "</td>" +
        "<td>" + celdaAccion + "</td>" +
        "</tr>"
      );
    })
    .join("");
}

function renderSocios() {
  const contenedor = document.getElementById("listaSocios");
  const busqueda = normalizar(textoBusqueda);

  const lista = [];
  for (let i = 0; i < socios.length; i++) {
    const socio = socios[i];
    if (busqueda !== "") {
      const textoSocio = normalizar(
        nombreCompleto(socio) + " " + socio.email + " " + socio.curso + " " + ETIQUETAS_ROL[socio.tipo] + " " + socio.dni
      );
      if (!textoSocio.includes(busqueda)) {
        continue;
      }
    }
    lista.push(socio);
  }

  if (lista.length === 0) {
    contenedor.innerHTML = '<div class="vacio"><p>No hay socios para mostrar.</p></div>';
    return;
  }

  contenedor.innerHTML = lista
    .map(function (socio) {
      let detalle = escapar(socio.email) + " · DNI " + escapar(socio.dni);
      if (socio.tipo === "ALUMNO" && socio.curso) {
        detalle = detalle + " · Curso " + escapar(socio.curso);
      }
      return (
        '<article class="socio">' +
        '<svg class="avatar" aria-hidden="true"><use href="#icono-persona"/></svg>' +
        '<div class="socio-datos">' +
        '<div class="socio-nombre">' + escapar(nombreCompleto(socio)) + "</div>" +
        '<div class="socio-detalle">' + detalle + "</div>" +
        "</div>" +
        etiquetaRol(socio) +
        "</article>"
      );
    })
    .join("");
}

function cambiarPestana(nombre) {
  const pestanas = document.querySelectorAll(".pestana");
  for (let i = 0; i < pestanas.length; i++) {
    if (pestanas[i].dataset.pestana === nombre) {
      pestanas[i].classList.add("activo");
      pestanas[i].setAttribute("aria-selected", "true");
    } else {
      pestanas[i].classList.remove("activo");
      pestanas[i].setAttribute("aria-selected", "false");
    }
  }

  if (nombre === "ingresar") {
    document.getElementById("formIngresar").hidden = false;
    document.getElementById("formRegistro").hidden = true;
  } else {
    document.getElementById("formIngresar").hidden = true;
    document.getElementById("formRegistro").hidden = false;
  }
}

function abrirDialogoSesion(pestana, aviso) {
  cambiarPestana(pestana);
  ocultarError("errorIngresar");
  ocultarError("errorRegistro");

  const cajaAviso = document.getElementById("avisoSesion");
  if (aviso) {
    cajaAviso.textContent = aviso;
    cajaAviso.hidden = false;
  } else {
    cajaAviso.hidden = true;
  }
  abrirDialogo("dialogoSesion");
}

function actualizarCampoCurso() {
  // El curso solo se pide a los estudiantes
  const campo = document.getElementById("campoCurso");
  const entrada = document.getElementById("registroCurso");
  if (document.getElementById("registroRol").value === "ALUMNO") {
    campo.hidden = false;
    entrada.required = true;
  } else {
    campo.hidden = true;
    entrada.required = false;
    entrada.value = "";
  }
}

async function despuesDeIniciarSesion(respuesta) {
  guardarSesion(respuesta.token, respuesta.usuario);
  cerrarDialogo("dialogoSesion");
  actualizarInterfaz();
  mostrarAviso("¡Hola, " + respuesta.usuario.nombre + "!");

  // Si había elegido un recurso antes de iniciar sesión, seguimos con ese pedido
  if (nombrePedidoPendiente !== null) {
    const nombre = nombrePedidoPendiente;
    nombrePedidoPendiente = null;
    await cargarRecursos();
    let grupoEncontrado = null;
    for (let i = 0; i < gruposVisibles.length; i++) {
      if (gruposVisibles[i].nombre === nombre) {
        grupoEncontrado = gruposVisibles[i];
      }
    }
    if (grupoEncontrado !== null && grupoEncontrado.unidad !== null) {
      abrirDialogoPedido(grupoEncontrado);
    }
    return;
  }

  renderVistaActual();
}

async function enviarIngreso(evento) {
  evento.preventDefault();
  ocultarError("errorIngresar");

  const email = document.getElementById("ingresarEmail").value.trim();
  const clave = document.getElementById("ingresarClave").value;

  if (email === "" || clave === "") {
    mostrarError("errorIngresar", "Completá el email y la contraseña.");
    return;
  }

  try {
    const respuesta = await pedirApi(URL_USUARIOS + "/login", {
      metodo: "POST",
      cuerpo: { email: email, password: clave }
    });
    document.getElementById("formIngresar").reset();
    await despuesDeIniciarSesion(respuesta);
  } catch (error) {
    mostrarError("errorIngresar", error.message);
  }
}

async function enviarRegistro(evento) {
  evento.preventDefault();
  ocultarError("errorRegistro");

  const nombre = document.getElementById("registroNombre").value.trim();
  const apellido = document.getElementById("registroApellido").value.trim();
  const dni = document.getElementById("registroDni").value.trim();
  const rol = document.getElementById("registroRol").value;
  const curso = document.getElementById("registroCurso").value.trim();
  const email = document.getElementById("registroEmail").value.trim();
  const clave = document.getElementById("registroClave").value;
  const clave2 = document.getElementById("registroClave2").value;

  if (nombre === "" || apellido === "") {
    mostrarError("errorRegistro", "Ingresá tu nombre y apellido completos.");
    return;
  }
  if (!/^[0-9]{6,9}$/.test(dni)) {
    mostrarError("errorRegistro", "El DNI debe tener entre 6 y 9 números, sin puntos.");
    return;
  }
  if (rol === "ALUMNO" && curso === "") {
    mostrarError("errorRegistro", "Los estudiantes tienen que indicar su curso.");
    return;
  }
  if (email === "" || !email.includes("@")) {
    mostrarError("errorRegistro", "Ingresá un email válido.");
    return;
  }
  if (clave.length < 6) {
    mostrarError("errorRegistro", "La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (clave !== clave2) {
    mostrarError("errorRegistro", "Las contraseñas no coinciden.");
    return;
  }

  try {
    const respuesta = await pedirApi(URL_USUARIOS + "/registro", {
      metodo: "POST",
      cuerpo: {
        nombre: nombre,
        apellido: apellido,
        dni: Number(dni),
        tipo: rol,
        curso: curso,
        email: email,
        password: clave
      }
    });
    document.getElementById("formRegistro").reset();
    actualizarCampoCurso();
    await despuesDeIniciarSesion(respuesta);
  } catch (error) {
    mostrarError("errorRegistro", error.message);
  }
}

function pedirRecurso(indice) {
  const grupo = gruposVisibles[indice];
  if (grupo === undefined || grupo.unidad === null) {
    return;
  }

  // Para pedir un préstamo hay que tener la sesión iniciada
  if (usuarioActual === null) {
    nombrePedidoPendiente = grupo.nombre;
    abrirDialogoSesion("ingresar", "Iniciá sesión o registrate para pedir un préstamo.");
    return;
  }
  abrirDialogoPedido(grupo);
}

function abrirDialogoPedido(grupo) {
  grupoAPedir = grupo;
  ocultarError("errorPedido");
  document.getElementById("pedidoObservaciones").value = "";
  document.getElementById("resumenPedido").innerHTML =
    "<strong>" + escapar(grupo.nombre) + "</strong><br>" +
    "Unidad: " + escapar(grupo.unidad.codigo) + "<br>" +
    "Estado: " + escapar(textoEstado(grupo.unidad.condicion)) + "<br>" +
    "Observaciones: " + escapar(grupo.unidad.observaciones) + "<br>" +
    "A nombre de: <strong>" + escapar(nombreCompleto(usuarioActual)) + "</strong>";
  abrirDialogo("dialogoPedido");
}

async function enviarPedido(evento) {
  evento.preventDefault();
  ocultarError("errorPedido");
  if (grupoAPedir === null || usuarioActual === null) {
    return;
  }

  const boton = document.getElementById("btnConfirmarPedido");
  boton.disabled = true;

  try {
    await pedirApi(URL_PRESTAMOS + "/solicitar", {
      metodo: "POST",
      cuerpo: {
        recursoId: grupoAPedir.unidad.id,
        observaciones: document.getElementById("pedidoObservaciones").value.trim()
      }
    });
    const nombre = grupoAPedir.nombre;
    grupoAPedir = null;
    cerrarDialogo("dialogoPedido");
    mostrarAviso("Pediste: " + nombre);
    mostrarVista("mis-prestamos");
  } catch (error) {
    mostrarError("errorPedido", error.message);
    await cargarRecursos();
  }

  boton.disabled = false;
}

function abrirDialogoDevolucion(idPrestamo) {
  let encontrado = null;
  for (let i = 0; i < todosLosPrestamos.length; i++) {
    if (todosLosPrestamos[i].id === idPrestamo) {
      encontrado = todosLosPrestamos[i];
    }
  }
  if (encontrado === null) {
    return;
  }

  prestamoADevolver = encontrado;
  ocultarError("errorDevolucion");
  document.getElementById("devolucionEstado").value = encontrado.estado;
  document.getElementById("devolucionObservaciones").value = "";
  document.getElementById("resumenDevolucion").innerHTML =
    "<strong>" + escapar(encontrado.recurso.nombre) + "</strong> (" + escapar(encontrado.recurso.codigo) + ")<br>" +
    "Lo tiene: <strong>" + escapar(nombreCompleto(encontrado.usuario)) + "</strong><br>" +
    "Retirado el " + escapar(formatearFecha(encontrado.fechaInicio));
  abrirDialogo("dialogoDevolucion");
}

async function enviarDevolucion(evento) {
  evento.preventDefault();
  ocultarError("errorDevolucion");
  if (prestamoADevolver === null) {
    return;
  }

  try {
    await pedirApi(URL_PRESTAMOS + "/" + prestamoADevolver.id + "/devolver", {
      metodo: "POST",
      cuerpo: {
        estado: document.getElementById("devolucionEstado").value,
        observaciones: document.getElementById("devolucionObservaciones").value.trim()
      }
    });
    prestamoADevolver = null;
    cerrarDialogo("dialogoDevolucion");
    mostrarAviso("Devolución registrada");
    await cargarTodosLosPrestamos();
  } catch (error) {
    mostrarError("errorDevolucion", error.message);
  }
}

function activarChips(chips, atributo, alElegir) {
  for (let i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      for (let j = 0; j < chips.length; j++) {
        chips[j].classList.remove("activo");
      }
      chips[i].classList.add("activo");
      alElegir(chips[i].dataset[atributo]);
    });
  }
}

function prepararEventos() {
  // Menú lateral
  const botonesMenu = document.querySelectorAll(".item-menu");
  for (let i = 0; i < botonesMenu.length; i++) {
    botonesMenu[i].addEventListener("click", function () {
      mostrarVista(botonesMenu[i].dataset.vista);
    });
  }

  // Buscador
  document.getElementById("buscador").addEventListener("input", function (evento) {
    textoBusqueda = evento.target.value;
    renderVistaActual();
  });

  // Filtros
  activarChips(document.querySelectorAll("[data-tipo]"), "tipo", function (valor) {
    filtroTipo = valor;
    renderRecursos();
  });
  activarChips(document.querySelectorAll("[data-filtro]"), "filtro", function (valor) {
    filtroPrestamos = valor;
    renderPrestamosAdmin();
  });

  // Botones de toda la página
  document.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (boton === null) {
      return;
    }

    if (boton.dataset.pedir !== undefined) {
      pedirRecurso(Number(boton.dataset.pedir));
    } else if (boton.dataset.devolver !== undefined) {
      abrirDialogoDevolucion(Number(boton.dataset.devolver));
    } else if (boton.dataset.cerrar !== undefined) {
      cerrarDialogo(boton.dataset.cerrar);
    } else if (boton.dataset.pestana !== undefined) {
      cambiarPestana(boton.dataset.pestana);
    } else if (boton.dataset.accion === "abrir-ingresar") {
      abrirDialogoSesion("ingresar", "");
    } else if (boton.dataset.accion === "abrir-registro") {
      abrirDialogoSesion("registro", "");
    } else if (boton.dataset.accion === "cerrar-sesion") {
      cerrarSesion();
    } else if (boton.dataset.accion === "ir-recursos") {
      mostrarVista("recursos");
    }
  });

  // Formularios
  document.getElementById("formIngresar").addEventListener("submit", enviarIngreso);
  document.getElementById("formRegistro").addEventListener("submit", enviarRegistro);
  document.getElementById("formPedido").addEventListener("submit", enviarPedido);
  document.getElementById("formDevolucion").addEventListener("submit", enviarDevolucion);
  document.getElementById("registroRol").addEventListener("change", actualizarCampoCurso);
}

async function iniciar() {
  prepararEventos();
  actualizarCampoCurso();
  await recuperarSesion();
  actualizarInterfaz();
  mostrarVista("recursos");
}

iniciar();

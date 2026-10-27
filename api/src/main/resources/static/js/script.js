const API = "/api";
const URL_USUARIOS = API + "/usuarios";
const URL_RECURSOS = API + "/recursos";
const URL_PRESTAMOS = API + "/prestamos";

const ICONOS = { COMPUTADORA: "💻", CALCULADORA: "🧮", LIBRO: "📖" };

let usuarios = [];
let recursos = [];
let prestamos = [];
let filtroPrestamos = "todos";

// ====== HELPERS ======
async function pedir(url, opciones = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || `Error ${res.status}`);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

function esc(t) {
  const d = document.createElement("div");
  d.textContent = t ?? "";
  return d.innerHTML;
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

// Soporta que el JSON venga como objeto anidado (usuario:{id}) o como id plano (usuarioId)
function idDe(p, campo) {
  return p[campo]?.id ?? p[campo + "Id"] ?? p[campo + "_id"];
}

function nombreUsuario(id) {
  const u = usuarios.find((x) => x.id === id);
  return u ? `${u.nombre} ${u.apellido}` : `#${id}`;
}

function nombreRecurso(id) {
  const r = recursos.find((x) => x.id === id);
  return r ? r.nombre : `#${id}`;
}

// Si tu backend espera otra forma, cambiás SOLO esta función
function armarPrestamo({ usuarioId, recursoId, estado, observaciones }) {
  return {
    fechaInicio: hoy(),
    fechaDevolucion: null,
    observaciones,
    estado,
    usuario: { id: usuarioId },
    recurso: { id: recursoId },
  };
}

// ====== CARGA DE DATOS ======
async function cargarTodo() {
  try {
    [usuarios, recursos, prestamos] = await Promise.all([
      pedir(URL_USUARIOS),
      pedir(URL_RECURSOS),
      pedir(URL_PRESTAMOS),
    ]);
    renderSelects();
    renderPrestamos();
    renderRecursos();
    renderUsuarios();
  } catch (e) {
    toast("No se pudo conectar con la API");
    console.error(e);
  }
}

// ====== RENDER ======
function renderSelects() {
  const selU = document.getElementById("selUsuario");
  const selR = document.getElementById("selRecurso");

  selU.innerHTML = usuarios
    .filter((u) => u.activo !== false)
    .map((u) => `<option value="${u.id}">${esc(u.nombre)} ${esc(u.apellido)} (${esc(u.tipo)})</option>`)
    .join("");

  const libres = recursos.filter((r) => r.estado === "DISPONIBLE");
  selR.innerHTML = libres.length
    ? libres.map((r) => `<option value="${r.id}">${esc(r.nombre)} [${esc(r.codigo)}]</option>`).join("")
    : `<option value="">No hay materiales disponibles</option>`;

  document.getElementById("btnPrestar").disabled = !libres.length;
}

function renderPrestamos() {
  const tb = document.getElementById("tbPrestamos");
  let lista = [...prestamos].sort((a, b) => b.id - a.id);

  if (filtroPrestamos === "activos") lista = lista.filter((p) => !p.fechaDevolucion);
  if (filtroPrestamos === "devueltos") lista = lista.filter((p) => p.fechaDevolucion);

  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="8">No hay préstamos para mostrar</td></tr>`;
    return;
  }

  tb.innerHTML = lista
    .map((p) => {
      const pendiente = !p.fechaDevolucion;
      return `
      <tr>
        <td>${p.id}</td>
        <td>${esc(nombreUsuario(idDe(p, "usuario")))}</td>
        <td>${esc(nombreRecurso(idDe(p, "recurso")))}</td>
        <td>${esc(p.fechaInicio)}</td>
        <td>${pendiente ? '<span class="badge pendiente">Pendiente</span>' : esc(p.fechaDevolucion)}</td>
        <td><span class="badge ${esc(p.estado)}">${esc(p.estado)}</span></td>
        <td>${esc(p.observaciones)}</td>
        <td>${pendiente ? `<button class="btn-sm" onclick="devolver(${p.id})">Devolver</button>` : ""}</td>
      </tr>`;
    })
    .join("");
}

function renderRecursos() {
  const tipo = document.getElementById("filtroTipo").value;
  const lista = recursos.filter((r) => !tipo || r.tipo === tipo);
  document.getElementById("gridRecursos").innerHTML = lista.length
    ? lista
        .map(
          (r) => `
      <div class="card">
        <div class="icono">${ICONOS[r.tipo] || "📦"}</div>
        <strong>${esc(r.nombre)}</strong>
        <small>Código: ${esc(r.codigo)} · ${esc(r.tipo)}</small>
        <span class="badge ${esc(r.estado)}">${r.estado === "DISPONIBLE" ? "Disponible" : "Prestado"}</span>
      </div>`
        )
        .join("")
    : "<p>No hay recursos de ese tipo.</p>";
}

function renderUsuarios() {
  document.getElementById("tbUsuarios").innerHTML = usuarios
    .map(
      (u) => `
    <tr>
      <td>${u.id}</td>
      <td>${esc(u.nombre)} ${esc(u.apellido)}</td>
      <td>${esc(u.dni ?? u.DNI)}</td>
      <td>${esc(u.curso) || "-"}</td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.tipo)}</td>
      <td>${u.activo ? "Sí" : "No"}</td>
    </tr>`
    )
    .join("");
}

// ====== ACCIONES ======
async function prestar() {
  const usuarioId = Number(document.getElementById("selUsuario").value);
  const recursoId = Number(document.getElementById("selRecurso").value);
  const estado = document.getElementById("selEstado").value;
  const observaciones = document.getElementById("inpObs").value.trim();
  const out = document.getElementById("resultado");

  if (!usuarioId || !recursoId) {
    out.innerHTML = `<div class="error">Elegí una persona y un material.</div>`;
    return;
  }

  try {
    await pedir(URL_PRESTAMOS, {
      method: "POST",
      body: JSON.stringify(armarPrestamo({ usuarioId, recursoId, estado, observaciones })),
    });

    // Marcamos el recurso como no disponible
    const recurso = recursos.find((r) => r.id === recursoId);
    await pedir(`${URL_RECURSOS}/${recursoId}`, {
      method: "PUT",
      body: JSON.stringify({ ...recurso, estado: "NO_DISPONIBLE" }),
    });

    out.innerHTML = `<div class="ok">✅ <strong>${esc(nombreUsuario(usuarioId))}</strong> retiró <strong>${esc(nombreRecurso(recursoId))}</strong>.</div>`;
    document.getElementById("inpObs").value = "";
    await cargarTodo();
  } catch (e) {
    out.innerHTML = `<div class="error">❌ No se pudo registrar: ${esc(e.message)}</div>`;
  }
}

async function devolver(id) {
  const p = prestamos.find((x) => x.id === id);
  if (!p) return;

  const estado = prompt("¿En qué estado vuelve? (BUENO / REGULAR / DEFECTUOSO)", p.estado);
  if (!estado) return;
  const estadoOk = estado.toUpperCase().trim();
  if (!["BUENO", "REGULAR", "DEFECTUOSO"].includes(estadoOk)) {
    toast("Estado inválido");
    return;
  }

  try {
    await pedir(`${URL_PRESTAMOS}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...p, fechaDevolucion: hoy(), estado: estadoOk }),
    });

    const recurso = recursos.find((r) => r.id === idDe(p, "recurso"));
    if (recurso) {
      await pedir(`${URL_RECURSOS}/${recurso.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...recurso, estado: "DISPONIBLE" }),
      });
    }

    toast("Devolución registrada ✅");
    await cargarTodo();
  } catch (e) {
    toast("Error: " + e.message);
  }
}

// ====== EVENTOS ======
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    filtroPrestamos = chip.dataset.filtro;
    renderPrestamos();
  });
});

document.getElementById("btnPrestar").addEventListener("click", prestar);
document.getElementById("filtroTipo").addEventListener("change", renderRecursos);

cargarTodo();
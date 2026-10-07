"use strict";

/* =========================================================
   Calculadora de Notas EPN - Lógica de validación y cálculo
   Calcula la nota final del semestre (bim1 + bim2) e indica
   la nota mínima que se necesita en el examen supletorio.
   ========================================================= */

// ---------- Constantes de la evaluación ----------
const LIMITES = {
  min: 0,
  max: 20,
  etiqueta: "nota",
};

const REGLAS = {
  EXONERACION: 28,          // bim1 + bim2 >= 28  -> aprueba (exonera)
  MINIMO_SUPLETORIO: 18,    // bim1 + bim2 >= 18  -> puede rendir supletorio
  MINIMA_REC: 24,           // rec >= 24          -> mínimo absoluto del supletorio
  TOTAL_APROBACION: 48,     // bim1 + bim2 + rec >= 48 -> pasa con supletorio
};

// ---------- Referencias al DOM ----------
const formulario = document.getElementById("formulario");
const campoBim1 = document.getElementById("bim1");
const campoBim2 = document.getElementById("bim2");
const errorBim1 = document.getElementById("bim1-error");
const errorBim2 = document.getElementById("bim2-error");
const botonLimpiar = document.getElementById("btn-limpiar");

const resultado = document.getElementById("resultado");
const tarjetaInicio = document.getElementById("inicio");
const resultadoIcono = document.getElementById("resultado-icono");
const resultadoTitulo = document.getElementById("resultado-titulo");
const resultadoMensaje = document.getElementById("resultado-mensaje");
const resultadoDatos = document.getElementById("resultado-datos");

const PARES = [
  { campo: campoBim1, error: errorBim1, etiqueta: "nota bim1" },
  { campo: campoBim2, error: errorBim2, etiqueta: "nota bim2" },
];

// ---------- Utilidades ----------

/** Redondea a 2 decimales para evitar errores de punto flotante (ej. 14.15 + 13.85). */
function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

/** Formatea un número mostrando hasta 2 decimales sin ceros sobrantes. */
function formatear(valor) {
  return String(redondear(valor));
}

/** Devuelve "1 punto" o "N puntos" para mensajes correctos en español. */
function puntos(cantidad) {
  return `${formatear(cantidad)} ${redondear(cantidad) === 1 ? "punto" : "puntos"}`;
}

/** Nota mínima que se debe obtener en el examen supletorio para pasar. */
function notaRequeridaEnSupletorio(suma) {
  return Math.max(REGLAS.MINIMA_REC, REGLAS.TOTAL_APROBACION - suma);
}

/** Lee el valor de un campo sin modificar el DOM. */
function leerValor(campo) {
  const texto = campo.value.trim();
  if (texto === "") return { estado: "vacio" };
  const valor = Number(texto);
  if (!Number.isFinite(valor)) return { estado: "invalido" };
  return { estado: "ok", valor };
}

/**
 * Lee y valida el valor de un campo, mostrando u ocultando su mensaje de error.
 * @returns {number|null} el valor válido o null si hay error / está vacío.
 */
function validarCampo({ campo, error, etiqueta }, { requerido }) {
  const lectura = leerValor(campo);

  if (lectura.estado === "vacio") {
    if (requerido) {
      mostrarError(campo, error, `Falta la ${etiqueta}. Ingresa un valor entre ${LIMITES.min} y ${LIMITES.max}.`);
    } else {
      limpiarError(campo, error);
    }
    return null;
  }

  if (lectura.estado === "invalido") {
    mostrarError(campo, error, `La ${etiqueta} debe ser un número (ej: 15.5).`);
    return null;
  }

  const valor = lectura.valor;

  if (valor < LIMITES.min || valor > LIMITES.max) {
    mostrarError(
      campo,
      error,
      `La ${etiqueta} debe estar entre ${LIMITES.min} y ${LIMITES.max}. El valor ingresado (${formatear(valor)}) está fuera de rango.`
    );
    return null;
  }

  limpiarError(campo, error);
  return valor;
}

function mostrarError(campo, elemento, mensaje) {
  elemento.textContent = mensaje;
  elemento.hidden = false;
  campo.classList.add("invalido");
  campo.setAttribute("aria-invalid", "true");
}

function limpiarError(campo, elemento) {
  elemento.textContent = "";
  elemento.hidden = true;
  campo.classList.remove("invalido");
  campo.removeAttribute("aria-invalid");
}

function ocultarResultado() {
  resultado.hidden = true;
  resultado.className = "resultado";
  tarjetaInicio.hidden = false;
}

/**
 * Recopila y valida los datos del formulario.
 * @param {boolean} exigirTodo - true al pulsar "Calcular" (exige campos vacíos).
 */
function recopilar(exigirTodo) {
  const bim1 = validarCampo(PARES[0], { requerido: exigirTodo });
  const bim2 = validarCampo(PARES[1], { requerido: exigirTodo });

  const faltanBimestrales = campoBim1.value.trim() === "" || campoBim2.value.trim() === "";

  if (bim1 === null || bim2 === null) {
    return { ok: false, faltanDatos: faltanBimestrales };
  }

  return { ok: true, bim1, bim2, suma: redondear(bim1 + bim2) };
}

// ---------- Renderizado del resultado ----------

function crearDato(etiqueta, valor, destacado = false) {
  const contenedor = document.createElement("div");
  contenedor.className = destacado ? "dato dato--destacado" : "dato";

  const etiquetaEl = document.createElement("span");
  etiquetaEl.className = "dato__etiqueta";
  etiquetaEl.textContent = etiqueta;

  const valorEl = document.createElement("span");
  valorEl.className = "dato__valor";
  valorEl.textContent = valor;

  contenedor.append(etiquetaEl, valorEl);
  return contenedor;
}

function renderizar(datos) {
  const { bim1, bim2, suma } = datos;
  let clase = "";
  let icono = "";
  let titulo = "";
  let mensaje = "";
  const tarjetas = [];

  if (suma >= REGLAS.EXONERACION) {
    // ---------- CASO 1: APRUEBA / EXONERA ----------
    clase = "resultado--aprobado";
    icono = "✔";
    titulo = "¡Apruebas la materia!";
    mensaje =
      `Tu nota final del semestre es ${formatear(suma)}/40, igual a bim1 (${formatear(bim1)}) + bim2 (${formatear(bim2)}). ` +
      `Al alcanzar las 28 puntos quedas exonerado y no necesitas rendir el examen supletorio.`;

    tarjetas.push(crearDato("bim1", formatear(bim1) + " / 20"));
    tarjetas.push(crearDato("bim2", formatear(bim2) + " / 20"));
    tarjetas.push(crearDato("Nota final del semestre", formatear(suma) + " / 40", true));
    tarjetas.push(crearDato("Exoneración desde", "28 / 40"));
  } else if (suma >= REGLAS.MINIMO_SUPLETORIO) {
    // ---------- CASO 2: DEBE RENDIR SUPLETORIO ----------
    const requerida = notaRequeridaEnSupletorio(suma);

    clase = "resultado--supletorio";
    icono = "📝";
    titulo = "Debes rendir el examen supletorio";
    mensaje =
      `Tu nota final del semestre es ${formatear(suma)}/40 (entre 18 y 27.99), por lo que debes rendir el examen supletorio. ` +
      `Necesitas al menos ${formatear(requerida)}/40 en ese examen para pasar la materia: ` +
      `la nota mínima es 24 y la suma bim1 + bim2 + examen debe ser mayor o igual a 48.`;

    tarjetas.push(crearDato("bim1", formatear(bim1) + " / 20"));
    tarjetas.push(crearDato("bim2", formatear(bim2) + " / 20"));
    tarjetas.push(crearDato("Nota final del semestre", formatear(suma) + " / 40"));
    tarjetas.push(crearDato("Nota mínima en el supletorio", formatear(requerida) + " / 40", true));
  } else {
    // ---------- CASO 3: NO ALCANZA EL SUPLETORIO ----------
    clase = "resultado--reprobado";
    icono = "⛔";
    titulo = "No alcanzas el examen supletorio";
    const faltan = redondear(REGLAS.MINIMO_SUPLETORIO - suma);
    mensaje =
      `Tu nota final del semestre es ${formatear(suma)}/40, inferior al mínimo de 18 requerido para rendir el examen supletorio. ` +
      `Te faltan ${puntos(faltan)} para poder rendirlo.`;

    tarjetas.push(crearDato("bim1", formatear(bim1) + " / 20"));
    tarjetas.push(crearDato("bim2", formatear(bim2) + " / 20"));
    tarjetas.push(crearDato("Nota final del semestre", formatear(suma) + " / 40", true));
    tarjetas.push(crearDato("Mínimo para supletorio", "18 / 40"));
  }

  resultado.className = `resultado ${clase}`;
  resultadoIcono.textContent = icono;
  resultadoTitulo.textContent = titulo;
  resultadoMensaje.textContent = mensaje;
  resultadoDatos.replaceChildren(...tarjetas);
  tarjetaInicio.hidden = true;
  resultado.hidden = false;
}

// ---------- Flujo principal ----------

/**
 * Valida los datos del formulario.
 * La tarjeta de resultado solo se muestra al pulsar "Calcular resultado"
 * (mostrarFaltantes = true); mientras se escribe solo se validan los campos.
 */
function actualizar(mostrarFaltantes) {
  const datos = recopilar(mostrarFaltantes);

  if (mostrarFaltantes && datos.ok) {
    renderizar(datos);
    return;
  }

  ocultarResultado();
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  actualizar(true);

  // En pantallas pequeñas la tarjeta queda debajo del formulario.
  if (!resultado.hidden) {
    resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

// Valida los campos mientras se escribe (la tarjeta de resultado no se toca).
PARES.forEach(({ campo }) => {
  campo.addEventListener("input", () => actualizar(false));
});

botonLimpiar.addEventListener("click", () => {
  formulario.reset();
  PARES.forEach((par) => limpiarError(par.campo, par.error));
  ocultarResultado();
  campoBim1.focus();
});

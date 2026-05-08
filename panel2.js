  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyADcEYKamrewxL8CDA8NmAuRZjp8eZ2XzY",
  authDomain: "femon-play.firebaseapp.com",
  databaseURL: "https://femon-play-default-rtdb.firebaseio.com",
  projectId: "femon-play",
  storageBucket: "femon-play.firebasestorage.app",
  messagingSenderId: "887768250224",
  appId: "1:63456783638:android:1e18d5484b58fc1411f437"
};

const adminApp = initializeApp(firebaseConfig);
const adminAuth = getAuth(adminApp);
const database = getDatabase(adminApp);
const API_BASE = "https://app.femon.net/api";

const limiteUsuariosElement = document.getElementById("limiteUsuarios");
const limiteUsuariosTrendElement = document.getElementById("limiteUsuariosTrend");
const limiteUsuariosDetalleElement = document.getElementById("limiteUsuariosDetalle");
const logoutButton = document.getElementById("logout");
const userUIDPreview = document.getElementById("userUIDPreview");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const adminMessageModal = document.getElementById("admin-message-modal");
const adminMessageText = document.getElementById("admin-message-text");
const viewReceiptButton = document.getElementById("viewReceiptButton");
const downloadReceiptButton = document.getElementById("downloadReceiptButton");
const receiptAction = document.getElementById("receiptAction");
const receiptNote = document.getElementById("receiptNote");

const totalUsuariosElement = document.getElementById("totalUsuarios");
const usuariosActivosElement = document.getElementById("usuariosActivos");
const usuariosVencidosElement = document.getElementById("usuariosVencidos");

const totalUsuariosDetalleElement = document.getElementById("totalUsuariosDetalle");
const usuariosActivosDetalleElement = document.getElementById("usuariosActivosDetalle");
const usuariosVencidosDetalleElement = document.getElementById("usuariosVencidosDetalle");

const totalUsuariosBarElement = document.getElementById("totalUsuariosBar");
const usuariosActivosBarElement = document.getElementById("usuariosActivosBar");
const usuariosVencidosBarElement = document.getElementById("usuariosVencidosBar");

const totalUsuariosTrendElement = document.getElementById("totalUsuariosTrend");
const usuariosActivosTrendElement = document.getElementById("usuariosActivosTrend");
const usuariosVencidosTrendElement = document.getElementById("usuariosVencidosTrend");

let adminUID = null;
let creandoCuenta = false;
let currentLimiteUsuarios = 0;
let ultimoComprobante = null;

const legacyGuardarComprobante = window.guardarComprobante;
const legacyAbrirComprobanteEnVentana = window.abrirComprobanteEnVentana;
const legacyDescargarComprobante = window.descargarComprobante;
const legacyGenerarHTMLComprobante = window.generarHTMLComprobante;
const legacyEscapeHtml = window.escapeHtml;

function showAdminMessage(text) {
  const message = String(text || "");
  if (!adminMessageModal || !adminMessageText) {
    window.alert(message);
    return;
  }

  adminMessageText.textContent = message;
  adminMessageModal.setAttribute("aria-hidden", "false");
}

function hideAdminMessage() {
  if (!adminMessageModal) return;
  adminMessageModal.setAttribute("aria-hidden", "true");
}

function setCreateButtonsDisabled(disabled) {
  const createButtons = document.querySelectorAll('button[onclick*="crearCuenta("]');
  createButtons.forEach((button) => {
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
    if (disabled) {
      button.dataset.originalText = button.dataset.originalText || button.textContent || "";
      button.textContent = "Creando...";
    } else if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  });
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

function escapeHtml(value) {
  if (typeof legacyEscapeHtml === "function") {
    return legacyEscapeHtml(value);
  }

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sumarDuracion(creacionDate, duracion, unidad) {
  const output = new Date(creacionDate.getTime());
  if (unidad === "meses") {
    output.setMonth(output.getMonth() + Number(duracion || 0));
  } else {
    output.setHours(output.getHours() + Number(duracion || 0));
  }
  return output;
}

function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isDemo(unidad) {
  return unidad !== "meses";
}

function generarComprobante(data) {
  ultimoComprobante = {
    ...data,
    creadoEn: new Date().toISOString()
  };

  window.ultimoComprobanteGenerado = ultimoComprobante;
  window.__ultimoComprobanteGenerado = ultimoComprobante;

  if (receiptAction) receiptAction.hidden = false;
  if (receiptNote) {
    receiptNote.textContent = `Último comprobante: ${ultimoComprobante.correo} • ${ultimoComprobante.detalle}`;
  }

  if (viewReceiptButton) viewReceiptButton.disabled = false;
  if (downloadReceiptButton) downloadReceiptButton.disabled = false;

  return ultimoComprobante;
}

function generarHTMLComprobante(data = ultimoComprobante) {
  if (typeof legacyGenerarHTMLComprobante === "function") {
    return legacyGenerarHTMLComprobante(data);
  }

  if (!data) return "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Comprobante Femon Play</title>
<style>
body{font-family:Arial,sans-serif;background:#0b1220;color:#fff;padding:24px}
.card{max-width:760px;margin:0 auto;background:#15233b;border-radius:16px;padding:20px;border:1px solid rgba(255,255,255,.15)}
h1{margin-top:0;font-size:22px}p{margin:6px 0}.label{opacity:.8;font-weight:bold}
</style>
</head>
<body>
  <div class="card">
    <h1>Comprobante de operación</h1>
    <p><span class="label">Tipo:</span> ${escapeHtml(data.tipo || "")}</p>
    <p><span class="label">Correo:</span> ${escapeHtml(data.correo || "")}</p>
    <p><span class="label">Contraseña:</span> ${escapeHtml(data.password || "")}</p>
    <p><span class="label">Creación:</span> ${escapeHtml(data.creacion || "")}</p>
    <p><span class="label">Vencimiento:</span> ${escapeHtml(data.vencimiento || "")}</p>
    <p><span class="label">Detalle:</span> ${escapeHtml(data.detalle || "")}</p>
  </div>
</body>
</html>`;
}

function abrirComprobanteEnVentana(data = ultimoComprobante) {
  if (typeof legacyAbrirComprobanteEnVentana === "function") {
    return legacyAbrirComprobanteEnVentana(data);
  }

  if (!data) {
    showAdminMessage("No hay comprobante disponible todavía.");
    return;
  }

  if (typeof window.openReceiptModal === "function") {
    window.openReceiptModal(data);
    return;
  }

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    showAdminMessage("No se pudo abrir la ventana del comprobante.");
    return;
  }
  w.document.write(generarHTMLComprobante(data));
  w.document.close();
}

function descargarComprobante(data = ultimoComprobante) {
  if (typeof legacyDescargarComprobante === "function") {
    return legacyDescargarComprobante(data);
  }

  if (!data) {
    showAdminMessage("No hay comprobante para descargar.");
    return;
  }

  const html = generarHTMLComprobante(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `comprobante-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function guardarComprobante(data) {
  if (typeof legacyGuardarComprobante === "function") {
    return legacyGuardarComprobante(data);
  }

  return generarComprobante(data);
}

async function copiarCredenciales(correo, password) {
  const content = `Correo: ${correo}\nContraseña: ${password}`;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
  } catch (error) {
    console.error("No se pudo copiar al portapapeles:", error);
  }

  return false;
}

async function refreshLimiteUsuarios() {
  if (!adminUID) return 0;

  try {
    const snapshot = await get(ref(database, `Admin/${adminUID}`));
    if (!snapshot.exists()) {
      currentLimiteUsuarios = 0;
      return 0;
    }

    const data = snapshot.val() || {};
    currentLimiteUsuarios = toFiniteNumber(data.limiteUsuarios);
    return currentLimiteUsuarios;
  } catch (error) {
    console.error("Error al refrescar créditos:", error);
    return currentLimiteUsuarios;
  }
}

async function verificarLimiteDisponible(duracion) {
  const limite = await refreshLimiteUsuarios();
  return limite >= Number(duracion || 0);
}

function updateAdminCreditDisplay(value) {
  const parsed = toFiniteNumber(value);
  currentLimiteUsuarios = parsed;

  if (limiteUsuariosElement) {
    limiteUsuariosElement.textContent = String(parsed);
  }

  if (limiteUsuariosDetalleElement) {
    limiteUsuariosDetalleElement.textContent = "Saldo disponible para nuevas cuentas.";
  }

  if (limiteUsuariosTrendElement) {
    limiteUsuariosTrendElement.textContent = `Actualizado ${new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date())}`;
  }
}

function parseFechaFlexible(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  if (typeof value === "string") {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (match) {
      const [, d, m, y, hh = "00", mm = "00", ss = "00"] = match;
      const parsed = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
}

function updateDashboardStats(usersMap) {
  if (!adminUID || !usersMap) return;

  const users = Object.values(usersMap).filter((user) => user && user.idv === adminUID);
  const total = users.length;
  const now = new Date();

  let activos = 0;
  let vencidos = 0;

  users.forEach((user) => {
    const expiration = parseFechaFlexible(user.benzymyentou || user.vencimiento);
    if (expiration && expiration >= now) {
      activos += 1;
    } else {
      vencidos += 1;
    }
  });

  const pctActivos = total > 0 ? Math.round((activos / total) * 100) : 0;
  const pctVencidos = total > 0 ? Math.round((vencidos / total) * 100) : 0;

  if (totalUsuariosElement) totalUsuariosElement.textContent = String(total);
  if (usuariosActivosElement) usuariosActivosElement.textContent = String(activos);
  if (usuariosVencidosElement) usuariosVencidosElement.textContent = String(vencidos);

  if (totalUsuariosDetalleElement) totalUsuariosDetalleElement.textContent = `Créditos disponibles: ${currentLimiteUsuarios}`;
  if (usuariosActivosDetalleElement) usuariosActivosDetalleElement.textContent = `${pctActivos}% del total`;
  if (usuariosVencidosDetalleElement) usuariosVencidosDetalleElement.textContent = `${pctVencidos}% del total`;

  if (totalUsuariosBarElement) totalUsuariosBarElement.style.width = "100%";
  if (usuariosActivosBarElement) usuariosActivosBarElement.style.width = `${pctActivos}%`;
  if (usuariosVencidosBarElement) usuariosVencidosBarElement.style.width = `${pctVencidos}%`;

  if (totalUsuariosTrendElement) totalUsuariosTrendElement.textContent = "Base total de clientes";
  if (usuariosActivosTrendElement) usuariosActivosTrendElement.textContent = activos > 0 ? "Cuentas vigentes" : "Sin cuentas activas";
  if (usuariosVencidosTrendElement) usuariosVencidosTrendElement.textContent = vencidos > 0 ? "Requieren renovación" : "Sin cuentas vencidas";
}

function listenUsuariosStats() {
  const usuariosRef = ref(database, "usuarios");
  onValue(usuariosRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : {};
    updateDashboardStats(data);
  }, (error) => {
    console.error("Error al cargar estadísticas:", error);
  });
}

window.crearCuenta = async function crearCuenta(duracion, unidad) {
  if (creandoCuenta) return;

  const email = (emailInput?.value || "").trim();
  const password = (passwordInput?.value || "").trim();

  if (!email || !password) {
    showAdminMessage("Completá correo y contraseña.");
    return;
  }

  if (password.length < 6) {
    showAdminMessage("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (unidad === "meses") {
    const ok = await verificarLimiteDisponible(duracion);
    if (!ok) {
      showAdminMessage("No tienes créditos suficientes.");
      return;
    }
  }

  creandoCuenta = true;
  setCreateButtonsDisabled(true);
  showAdminMessage("Creando cuenta...");

  try {
    // Compatibilidad temporal: se envía adminUID, pero el backend debe validar autenticación y ownership server-side.
    const response = await fetch(`${API_BASE}/createUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        duracion,
        unidad,
        adminUID
      })
    });

    let result = {};
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error("Respuesta API no JSON:", jsonError);
    }

    if (!response.ok) {
      const apiMessage = result?.error || result?.message || "No se pudo crear la cuenta.";
      throw new Error(apiMessage);
    }

    const correoCreado = result.email || email;
    const passCreada = result.password || password;
    const creacion = result.creacion || formatDateTime(new Date());
    const vencimientoCalculado = formatDateTime(sumarDuracion(new Date(), duracion, unidad));
    const vencimiento = result.vencimiento || vencimientoCalculado;
    const tipo = isDemo(unidad) ? "Creación de cuenta demo" : "Creación de cuenta";
    const detalle = isDemo(unidad)
      ? `Cuenta demo creada por ${duracion} ${Number(duracion) === 1 ? "hora" : "horas"}.`
      : `Cuenta creada por ${duracion} ${Number(duracion) === 1 ? "mes" : "meses"}.`;

    emailInput.value = "";
    passwordInput.value = "";

    const copied = await copiarCredenciales(correoCreado, passCreada);
    const comprobante = guardarComprobante({
    tipo,
    correo: correoCreado,
    password: passCreada,
    creacion,
    vencimiento,
    operacion: creacion,
    detalle
});

    if (comprobante && !ultimoComprobante) {
      generarComprobante(comprobante);
    }

    const refreshedCredits = await refreshLimiteUsuarios();
    updateAdminCreditDisplay(refreshedCredits);

    if (typeof window.cargarEstadisticas === "function") {
      try {
        await window.cargarEstadisticas();
      } catch (statsError) {
        console.error("No se pudieron refrescar estadísticas globales:", statsError);
      }
    }

    showAdminMessage(
      copied
        ? `Cuenta creada con éxito.\nCredenciales copiadas al portapapeles.\n\nCorreo: ${correoCreado}\nContraseña: ${passCreada}`
        : `Cuenta creada con éxito.\n\nCorreo: ${correoCreado}\nContraseña: ${passCreada}`
    );
  } catch (error) {
    console.error("Error al crear cuenta vía API segura:", error);

    if (error instanceof TypeError) {
      showAdminMessage("No se pudo conectar con la API segura.");
    } else {
      showAdminMessage(error.message || "No se pudo crear la cuenta.");
    }
  } finally {
    creandoCuenta = false;
    setCreateButtonsDisabled(false);
  }
};

onAuthStateChanged(adminAuth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  adminUID = user.uid;

  if (userUIDPreview) {
    userUIDPreview.textContent = user.uid;
  }

  const adminRef = ref(database, `Admin/${user.uid}`);
  onValue(adminRef, (snapshot) => {
    if (!snapshot.exists()) {
      updateAdminCreditDisplay(0);
      return;
    }

    const data = snapshot.val() || {};
    updateAdminCreditDisplay(data.limiteUsuarios);
  }, (error) => {
    console.error("Error al leer Admin/limiteUsuarios:", error);
  });

  listenUsuariosStats();
});

logoutButton?.addEventListener("click", async () => {
  await signOut(adminAuth);
  window.location.href = "index.html";
});

viewReceiptButton?.addEventListener("click", () => {
  abrirComprobanteEnVentana();
});

downloadReceiptButton?.addEventListener("click", () => {
  descargarComprobante();
});

window.hideAdminMessage = hideAdminMessage;
window.escapeHtml = escapeHtml;
window.guardarComprobante = guardarComprobante;
window.abrirComprobanteEnVentana = abrirComprobanteEnVentana;
window.descargarComprobante = descargarComprobante;
window.generarHTMLComprobante = generarHTMLComprobante;

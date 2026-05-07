<!DOCTYPE html> 
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vendedor • Femon Play</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{
      --bg:#0b1020;--card:#121830;--muted:#7c86a2;--text:#e7ecff;--brand:#6c8cff;--brand-2:#9aaeff;--ok:#16a34a;--warn:#f59e0b;--err:#ef4444;--border:rgba(255,255,255,.08)
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;
      background:
        radial-gradient(1200px 800px at 80% -20%,rgba(108,140,255,.25),transparent),
        radial-gradient(1200px 800px at -10% 120%,rgba(77,98,255,.25),transparent),
        var(--bg);
      color:var(--text);
      font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      text-rendering:optimizeLegibility;
    }
    a{color:var(--brand)}
    .wrap{min-height:100%;display:grid;place-items:center;padding:24px}
    .shell{width:min(1100px,100%);display:grid;gap:24px}

    /* Card base */
    .card{
      background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
      backdrop-filter:blur(8px);
      border:1px solid var(--border);
      border-radius:18px;
      box-shadow:0 20px 60px rgba(0,0,0,.35);
      overflow:hidden;
      contain:paint;
    }
    .card .hd{padding:22px 22px 0}
    .card .hd h1{margin:0;font-size:24px;letter-spacing:.2px}
    .card .bd{padding:22px}

    .grid{display:grid;gap:16px}
    .grid.cols-2{grid-template-columns:repeat(2,1fr)}
    @media (max-width:860px){.grid.cols-2{grid-template-columns:1fr}}

    label{font-weight:600;color:#cad3ff;font-size:14px;margin-bottom:6px;display:block}
    input,select{
      width:100%;
      padding:12px 14px;
      background:#0e1430;
      border:1px solid var(--border);
      color:var(--text);
      border-radius:12px;
      outline:none
    }
    input:focus,select:focus{border-color:var(--brand)}

    .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .btn{
      appearance:none;border:1px solid var(--border);
      background:linear-gradient(180deg,#2a3569,#222b55);
      color:var(--text);padding:12px 16px;border-radius:12px;
      font-weight:600;cursor:pointer;
      transition:.15s transform,.15s opacity,.15s box-shadow;
      display:inline-flex;align-items:center;gap:10px;justify-content:center;
      will-change:transform;
    }
    .btn:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(0,0,0,.35)}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .btn.primary{background:linear-gradient(180deg,var(--brand),#4f69ff);border-color:rgba(255,255,255,.15)}
    .btn.ghost{background:transparent}
    .btn.warn{background:linear-gradient(180deg,#ffb454,#ff9544)}
    .btn.block{width:100%}
    .btn.sm{padding:8px 12px;font-size:13px;border-radius:10px}

    .badge{
      display:inline-flex;align-items:center;gap:8px;
      background:#0f1535;border:1px solid var(--border);
      padding:8px 12px;border-radius:999px;color:#c9d2ff;max-width:100%;overflow:hidden;text-overflow:ellipsis
    }

    .muted{color:var(--muted)}
    .hidden{display:none !important}

    .split{display:grid;grid-template-columns:320px 1fr;gap:24px}
    @media (max-width:980px){.split{grid-template-columns:1fr}}

    .panel-title{font-size:18px;font-weight:700;margin:0 0 4px}
    .panel-sub{margin:0 0 18px;color:var(--muted)}

    .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    @media (max-width:980px){.kpi{grid-template-columns:1fr}}
    .kpi .tile{border:1px solid var(--border);background:#0f1535;border-radius:16px;padding:16px}
    .tile .big{font-size:28px;font-weight:800}

    pre.log{
      background:#0a0f25;border:1px solid var(--border);padding:14px;border-radius:12px;
      max-height:260px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
      font-size:12.5px;white-space:pre-wrap;
      contain:paint;
    }

    .warnbox{
      border:1px solid rgba(255,176,0,.35);
      background:linear-gradient(180deg,rgba(255,176,0,.08),rgba(255,176,0,.04));
      padding:14px;border-radius:12px;color:#ffe5b4
    }
    .ok{color:var(--ok)}.err{color:var(--err)}

    .toolbar{display:flex;gap:12px;flex-wrap:wrap}

    .sidebar .bd{display:grid;gap:18px}
    .sidebar .row-top{display:flex;gap:12px;align-items:center;justify-content:space-between}
    .sidebar .stack{display:grid;gap:10px}

    @media (prefers-reduced-motion: reduce){
      .btn{transition:none}
    }

    /* 👁️ OJITO: estilos para botón de mostrar/ocultar contraseña */
    .input-wrap{position:relative}
    input.has-eye{padding-right:44px}
    .eye-toggle{
      position:absolute;right:10px;top:50%;transform:translateY(-50%);
      background:transparent;border:0;padding:6px;cursor:pointer;color:var(--muted);
      border-radius:8px;display:inline-flex;align-items:center;justify-content:center
    }
    .eye-toggle:hover{color:var(--text);background:rgba(255,255,255,.06)}
    .eye-toggle:focus{outline:2px solid var(--brand);outline-offset:2px}
    .eye-toggle svg{width:20px;height:20px}
    .eye-toggle .icon-eye-off{display:none}
    .eye-toggle[data-state="visible"] .icon-eye{display:none}
    .eye-toggle[data-state="visible"] .icon-eye-off{display:inline}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="shell">

      <!-- AUTH -->
      <section id="login-card" class="card">
        <div class="hd">
          <h1>Iniciar sesión • Panel de Vendedor</h1>
          <p class="muted" style="margin:8px 0 0">Accede para ver tus créditos y crear sub-vendedores.</p>
        </div>
        <div class="bd">
          <form id="login-form" class="grid cols-2" autocomplete="on">
            <div>
              <label for="email">Correo</label>
              <input id="email" type="email" placeholder="vendedor@dominio.com" required />
            </div>
              <div>
                <label for="password">Contraseña</label>
                <div class="input-wrap">
                  <input id="password" type="text" placeholder="••••••••" required class="has-eye" />
                  <button type="button" class="eye-toggle" data-eye-target="#password" aria-label="Ocultar contraseña" aria-pressed="true" data-state="visible" title="Ocultar/Mostrar">
                  <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 3l18 18"/>
                    <path d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4"/>
                    <path d="M17.9 17.9C15.9 19.3 14 19 12 19 6 19 2 12 2 12a20.3 20.3 0 016.1-6.1"/>
                    <path d="M14.1 5.1A8.8 8.8 0 0122 12s-1.2 2.1-3.1 3.9"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="row" style="grid-column:1/-1;justify-content:space-between">
              <span id="auth-hint" class="muted">Solo usuarios que existan en <code>/Admin</code> pueden entrar.</span>
              <button class="btn primary" id="login-btn" type="submit">Ingresar</button>
            </div>
            <div id="login-error" class="err" style="grid-column:1/-1"></div>
          </form>
        </div>
      </section>

      <!-- DASHBOARD -->
      <section id="panel" class="hidden">
        <div class="split">

          <!-- SIDEBAR -->
          <div class="card sidebar">
            <div class="bd">
              <div class="row-top">
                <div class="badge">
                  <span style="width:8px;height:8px;border-radius:999px;background:var(--ok)"></span>
                  <span id="whoami" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Conectando…</span>
                </div>
                <button id="logout" class="btn ghost sm" title="Cerrar sesión">Salir</button>
              </div>

              <div>
                <p class="panel-title">Accesos rápidos</p>
                <div class="stack">
                  <button id="ver-vendedores" class="btn block" title="Ver vendedores creados">Ver vendedores creados</button>
                  <small class="muted" style="text-align:center"> <code> </code> </small>
                </div>
              </div>

              <!-- (Se eliminó la sección de Mantenimiento / reset de deviceID) -->
            </div>
          </div>

          <!-- MAIN -->
          <div class="grid" style="gap:24px">
            <!-- KPIs (simplificados) -->
            <div class="kpi">
              <div class="tile">
                <div class="muted">Estado</div>
                <div id="kpi-status" class="big">Offline</div>
              </div>
              <div class="tile">
                <div class="muted">Créditos disponibles</div>
                <div id="kpi-creditos" class="big">—</div>
              </div>
            </div>

            <!-- CREAR VENDEDOR -->
            <div class="card">
              <div class="hd">
                <h1>Crear nuevo vendedor</h1>
                <p class="muted" style="margin-top:6px">Esta operación usa <b>una sesión secundaria</b> para no desconectarte.</p>
              </div>
              <div class="bd">
                <form id="form-vendedor" class="grid cols-2" autocomplete="off">
                  <div>
                    <label for="v-email">Correo del vendedor</label>
                    <input id="v-email" type="email" placeholder="vendedor@dominio.com" required />
                  </div>
                  <div>
                    <label for="v-pass">Contraseña temporal</label>
                    <div class="input-wrap">
                      <input id="v-pass" type="text" placeholder="mínimo 6 caracteres" minlength="6" required class="has-eye" />
                      <button type="button" class="eye-toggle" data-eye-target="#v-pass" aria-label="Ocultar contraseña" aria-pressed="true" data-state="visible" title="Ocultar/Mostrar">
                        <svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M3 3l18 18"/>
                          <path d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4"/>
                          <path d="M17.9 17.9C15.9 19.3 14 19 12 19 6 19 2 12 2 12a20.3 20.3 0 016.1-6.1"/>
                          <path d="M14.1 5.1A8.8 8.8 0 0122 12s-1.2 2.1-3.1 3.9"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label for="v-creditos">Créditos (limiteUsuarios)</label>
                    <input id="v-creditos" type="number" min="0" step="1" value="0" required />
                  </div>
                  <div class="toolbar" style="grid-column:1/-1;justify-content:flex-end">
                    <button type="reset" class="btn ghost">Limpiar</button>
                    <button id="crear-vendedor" type="submit" class="btn primary">Crear vendedor</button>
                  </div>
                  <div id="vendedor-error" class="err" style="grid-column:1/-1"></div>
                  <div id="vendedor-ok" class="ok" style="grid-column:1/-1"></div>
                </form>
              </div>
            </div>

            <!-- LOGS -->
            <div class="card">
              <div class="hd"><h1>Registro</h1></div>
              <div class="bd">
                <pre id="log" class="log">Inicia sesión para usar el panel…</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <script type="module">
    // ============================
    // Firebase SDK (v10+ modular)
    // ============================
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    import { getDatabase, ref, get, set, update, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

    // --- Config provista ---
 const firebaseConfig = {
    apiKey: "AIzaSyADcEYKamrewxL8CDA8NmAuRZjp8eZ2XzY",
    authDomain: "femon-play.firebaseapp.com",
    databaseURL: "femon-play-default-rtdb.firebaseio.com",
    projectId: "femon-play",
    storageBucket: "femon-play.firebasestorage.app",
    messagingSenderId: "887768250224",
    appId: "1:63456783638:android:1e18d5484b58fc1411f437"
};


    // App principal (sesión del Vendedor)
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    // App secundaria para crear cuentas sin cerrar la sesión actual
    const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
    const secondaryAuth = getAuth(secondaryApp);

    // ============================
    // Utilidades UI
    // ============================
    const $ = (sel) => document.querySelector(sel);
    const logEl = $('#log');

    // Logger con buffer para evitar jank en operaciones
    const createLogger = (el, { maxChars = 256 * 1024 } = {}) => {
      let buf = [];
      let scheduled = false;
      const flush = () => {
        if (!buf.length) { scheduled = false; return; }
        const add = buf.join('\n');
        buf.length = 0;
        let next = el.textContent ? el.textContent + '\n' + add : add;
        if (next.length > maxChars) next = next.slice(next.length - maxChars);
        el.textContent = next;
        el.scrollTop = el.scrollHeight;
        scheduled = false;
      };
      return (msg) => {
        console.log(msg);
        buf.push(msg);
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(flush);
        }
      };
    };

    const log = createLogger(logEl, { maxChars: 256 * 1024 });

    const setBusy = (btn, busyText = 'Procesando…') => { btn.dataset.prev = btn.textContent; btn.textContent = busyText; btn.disabled = true; };
    const unsetBusy = (btn) => { if(btn.dataset.prev){ btn.textContent = btn.dataset.prev; delete btn.dataset.prev; } btn.disabled = false; };

    // Accesos DOM
    const loginCard = $('#login-card');
    const loginForm = $('#login-form');
    const loginBtn = $('#login-btn');
    const loginErr = $('#login-error');
    const panel = $('#panel');
    const whoami = $('#whoami');
    const logoutBtn = $('#logout');
    const kpiStatus = $('#kpi-status');
    const kpiCreditos = $('#kpi-creditos');

    const formVend = $('#form-vendedor');
    const btnCrearVend = $('#crear-vendedor');
    const vendErr = $('#vendedor-error');
    const vendOk = $('#vendedor-ok');

    const verVendedoresBtn = $('#ver-vendedores');

    // Personaliza destino del botón "Ver vendedores creados"
    const VENDORS_URL = 'https://vimetrix.lat/femonpanel/admin/vervendedores.php';
    verVendedoresBtn.addEventListener('click', () => {
      if (VENDORS_URL && VENDORS_URL !== '#') {
        window.location.href = VENDORS_URL;
      } else {
        alert('Configura la URL de "Ver vendedores creados" en la constante VENDORS_URL.');
      }
    });

    // ============================
    // Autenticación + Autorización (/Admin)
    // ============================
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        whoami.textContent = user.email;
        logEl.textContent = 'Verificando permisos…';
        try {
          const adminRef = ref(db, 'Admin/' + user.uid);
          const snap = await get(adminRef);
          if (!snap.exists()) {
            loginErr.textContent = 'Tu cuenta no está habilitada como Vendedor (no figura en /Admin).';
            await signOut(auth);
            return;
          }
          const row = snap.val() || {};
          if (row.email && String(row.email).toLowerCase() !== String(user.email).toLowerCase()) {
            loginErr.textContent = 'El correo autenticado no coincide con el registrado en /Admin.';
            await signOut(auth);
            return;
          }
          loginCard.classList.add('hidden');
          panel.classList.remove('hidden');
          kpiStatus.textContent = 'Online';
          kpiCreditos.textContent = String(typeof row.limiteUsuarios === 'number' ? row.limiteUsuarios : 0);
          log('Permisos verificados. Puedes crear vendedores.');
        } catch (err) {
          console.error(err);
          loginErr.textContent = 'Error verificando permisos. Intenta de nuevo.';
          await signOut(auth);
        }
      } else {
        panel.classList.add('hidden');
        loginCard.classList.remove('hidden');
        logEl.textContent = 'Inicia sesión para usar el panel…';
        kpiStatus.textContent = 'Offline';
        kpiCreditos.textContent = '—';
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = /** @type {HTMLInputElement} */(document.getElementById('email')).value.trim();
      const pass = /** @type {HTMLInputElement} */(document.getElementById('password')).value;
      loginErr.textContent = '';
      setBusy(loginBtn, 'Ingresando…');
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (err) {
        console.error(err);
        loginErr.textContent = `Error: ${String(err.code || err.message).replace('auth/','')}`;
      } finally { unsetBusy(loginBtn); }
    });

    logoutBtn.addEventListener('click', async () => {
      try { await signOut(auth); } catch (err) { console.error('Error al cerrar sesión', err); }
    });

    // ============================
    // Helpers de créditos
    // ============================
    async function refreshMyCredits() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await get(ref(db, 'Admin/' + user.uid + '/limiteUsuarios'));
        if (snap.exists()) {
          kpiCreditos.textContent = String(snap.val());
        }
      } catch (e) {
        console.warn('No se pudieron refrescar créditos', e);
      }
    }

    // ============================
    // Crear Vendedor (sesión secundaria + descuento de créditos + idv del creador)
    // ============================
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    formVend.addEventListener('submit', async (e) => {
      e.preventDefault();
      vendErr.textContent = '';
      vendOk.textContent = '';
      const email = /** @type {HTMLInputElement} */(document.getElementById('v-email')).value.trim();
      const pass  = /** @type {HTMLInputElement} */(document.getElementById('v-pass')).value;
      const creditos = Number(/** @type {HTMLInputElement} */(document.getElementById('v-creditos')).value);

      if (!emailRe.test(email)) { vendErr.textContent = 'Correo inválido.'; return; }
      if (!pass || pass.length < 6) { vendErr.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }
      if (Number.isNaN(creditos) || creditos < 0) { vendErr.textContent = 'Créditos inválidos.'; return; }

      const me = auth.currentUser;
      if (!me) { vendErr.textContent = 'Debes iniciar sesión.'; return; }

      setBusy(btnCrearVend, 'Creando…');
      let reserved = false;
      let reservedResult = null;

      try {
        // 1) Reservar créditos (transacción) si > 0
        if (creditos > 0) {
          const myCreditsRef = ref(db, 'Admin/' + me.uid + '/limiteUsuarios');
          reservedResult = await runTransaction(myCreditsRef, (current) => {
            if (typeof current !== 'number') return current;
            if (current >= creditos) {
              return current - creditos; // descuenta
            }
            return; // aborta transacción
          });
          if (!reservedResult.committed) {
            const disponible = reservedResult.snapshot && typeof reservedResult.snapshot.val() === 'number'
              ? reservedResult.snapshot.val() : 0;
            vendErr.textContent = `Créditos insuficientes. Disponibles: ${disponible}.`;
            return;
          }
          reserved = true;
          kpiCreditos.textContent = String(reservedResult.snapshot.val());
          log(`Reservados ${creditos} créditos. Restantes: ${reservedResult.snapshot.val()}`);
        }

        // 2) Crear usuario con instancia secundaria
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
        const nuevo = cred.user;

        // 3) Guardar datos del vendedor en Realtime Database
        await set(ref(db, 'Admin/' + nuevo.uid), {
          email: email,
          limiteUsuarios: creditos,
          creadoEn: new Date().toISOString(),
          creadoPor: me.email || null,
          idv: me.uid // 🔹 UID del vendedor que creó a este vendedor
        });

        vendOk.textContent = `Vendedor creado con UID: ${nuevo.uid}`;
        formVend.reset();
        log(`Vendedor creado: ${email} (uid: ${nuevo.uid})`);

        // 4) Refrescar créditos
        await refreshMyCredits();

      } catch (err) {
        console.error(err);
        // Rollback si reservamos créditos y falló la creación
        if (reserved && creditos > 0) {
          try {
            const myCreditsRef = ref(db, 'Admin/' + me.uid + '/limiteUsuarios');
            const rb = await runTransaction(myCreditsRef, (current) => {
              if (typeof current !== 'number') return current;
              return current + creditos;
            });
            kpiCreditos.textContent = String(rb.snapshot.val());
            log('Se revirtieron los créditos reservados debido a un error.');
          } catch (rbErr) {
            console.error('Error al revertir créditos:', rbErr);
          }
        }
        vendErr.textContent = `Error al crear vendedor: ${String(err.code||err.message).replace('auth/','')}`;
      } finally {
        try { await signOut(secondaryAuth); } catch {}
        unsetBusy(btnCrearVend);
      }
    });

    // ============================
    // 👁️ OJITO: comportamiento mostrar/ocultar contraseña
    // ============================
    const bindPasswordEye = (btn) => {
      const targetSel = btn.getAttribute('data-eye-target');
      const input = targetSel ? document.querySelector(targetSel) : null;
      if (!input) return;
      btn.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.setAttribute('data-state', isHidden ? 'visible' : 'hidden');
        btn.setAttribute('aria-pressed', String(isHidden));
        btn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
      });
    };
    document.querySelectorAll('.eye-toggle[data-eye-target]').forEach(bindPasswordEye);
  </script>
</body>
</html>

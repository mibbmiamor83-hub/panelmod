<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ver Vendedores • Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{
      --bg:#0b0f17; --card:#111827; --muted:#6b7280; --text:#f9fafb; --accent:#22d3ee; --accent-2:#60a5fa; --danger:#f87171;
      --ring: 0 0 0 2px rgba(34,211,238,.3);
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{margin:0; font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial; background:linear-gradient(160deg,#0b0f17 0%, #0e1320 60%, #0b0f17 100%); color:var(--text);} 
    .container{max-width:1100px; margin:0 auto; padding:24px;}
    header{display:flex; align-items:center; gap:12px; justify-content:space-between; margin-bottom:16px}
    .brand{display:flex; gap:10px; align-items:center}
    .brand .logo{width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg, var(--accent), var(--accent-2)); box-shadow:0 8px 30px rgba(34,211,238,.35)}
    .brand h1{font-size:18px; margin:0; font-weight:700; letter-spacing:.2px}
    .card{background:radial-gradient(1200px 300px at -20% -10%, rgba(34,211,238,.08), transparent),
                     radial-gradient(800px 300px at 120% 10%, rgba(96,165,250,.08), transparent),
                     var(--card);
          border:1px solid rgba(255,255,255,.06); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.35)}
    .toolbar{display:flex; flex-wrap:wrap; gap:12px; padding:16px}
    .search{position:relative; flex:1 1 320px}
    .search input{width:100%; background:#0f172a; color:var(--text); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:12px 40px 12px 40px; outline:none}
    .search input:focus{box-shadow:var(--ring); border-color:rgba(34,211,238,.35)}
    .search .icon{position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:.6}
    .btn{background:linear-gradient(135deg,#1f2937,#0f172a); color:var(--text); border:1px solid rgba(255,255,255,.08); padding:10px 14px; border-radius:12px; cursor:pointer}
    .btn:hover{border-color:rgba(255,255,255,.16)}
    .btn.outline{background:transparent}
    .status{margin-left:auto; font-size:12px; color:var(--muted)}

    /* table */
    .table-wrap{overflow:auto; border-top:1px solid rgba(255,255,255,.06)}
    table{width:100%; border-collapse:separate; border-spacing:0}
    thead th{position:sticky; top:0; backdrop-filter:saturate(120%) blur(6px); background:rgba(17,24,39,.9); text-align:left; font-weight:600; color:#cbd5e1; padding:12px; border-bottom:1px solid rgba(255,255,255,.08)}
    tbody td{padding:12px; border-bottom:1px dashed rgba(255,255,255,.06);}
    tbody tr{transition:background .15s ease}
    tbody tr:hover{background:rgba(255,255,255,.03)}
    .pill{font-size:12px; padding:4px 8px; border-radius:999px; border:1px solid rgba(255,255,255,.12)}

    /* login */
    #loginView{display:none; max-width:420px; margin:10vh auto}
    .login-card{padding:22px}
    .login-card h2{margin:0 0 12px 0}
    .field{display:flex; flex-direction:column; gap:6px}
    .field input{padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:#0f172a; color:var(--text)}
    .field input:focus{outline:none; box-shadow:var(--ring)}
    .login-actions{display:flex; gap:10px; align-items:center; margin-top:14px}

    /* context menu */
    .menu{position:fixed; z-index:9999; min-width:220px; background:#0b1220; border:1px solid rgba(255,255,255,.12); border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,.45); display:none}
    .menu header{padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.08)}
    .menu header h4{margin:0; font-size:13px; color:#cbd5e1}
    .menu .item{display:flex; gap:10px; align-items:center; padding:10px 12px; cursor:pointer}
    .menu .item:hover{background:rgba(255,255,255,.06)}
    .menu .item small{color:#94a3b8}
    .danger{color:var(--danger)}

    /* skeleton */
    .skeleton{height:52px; background:linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.08), rgba(255,255,255,.04)); background-size:200% 100%; animation:shine 1.2s infinite}
    @keyframes shine{0%{background-position:200% 0} 100%{background-position:-200% 0}}
    .empty{padding:28px; text-align:center; color:var(--muted)}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="logo" aria-hidden="true"></div>
        <h1>Ver Vendedores</h1>
      </div>
      <div class="status" id="authStatus">—</div>
      <button id="btnLogout" class="btn outline" style="display:none">Cerrar sesión</button>
    </header>

    <!-- LOGIN VIEW -->
    <section id="loginView" class="card login-card">
      <h2>Acceso de Administrador</h2>
      <p class="muted" style="color:var(--muted); margin:6px 0 16px">Inicia sesión para gestionar vendedores.</p>
      <div class="field">
        <label for="lemail">Correo</label>
        <input id="lemail" type="email" placeholder="admin@tu-dominio.com" autocomplete="username" />
      </div>
      <div class="field" style="margin-top:10px">
        <label for="lpass">Contraseña</label>
        <input id="lpass" type="text" placeholder="••••••••" autocomplete="current-password" />
      </div>
      <div class="login-actions">
        <button id="btnLogin" class="btn">Entrar</button>
        <small id="loginMsg" style="color:var(--muted)"></small>
      </div>
    </section>

    <!-- APP VIEW -->
    <section id="appView" class="card" style="display:none">
      <div class="toolbar">
        <div class="search">
          <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/></svg>
          <input id="search" type="search" placeholder="Buscar vendedor por correo… (Ctrl+/)" />
        </div>
        <div class="pill" id="countBadge">0 vendedores</div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:48px">#</th>
              <th>Correo</th>
              <th style="width:200px">Créditos (limiteUsuarios)</th>
            </tr>
          </thead>
          <tbody id="rows">
            <tr><td colspan="3"><div class="skeleton"></div></td></tr>
            <tr><td colspan="3"><div class="skeleton"></div></td></tr>
            <tr><td colspan="3"><div class="skeleton"></div></td></tr>
          </tbody>
        </table>
      </div>
      <div id="emptyState" class="empty" style="display:none">No hay resultados</div>
    </section>
  </div>

  <!-- Contextual menu -->
  <div id="ctx" class="menu" role="menu" aria-hidden="true">
    <header><h4 id="ctxTitle">Acciones</h4></header>
    <div class="item" id="ctxEditCreditos">✏️ Editar créditos</div>
    <div class="item" id="ctxCambiarPw">🔐 Cambiar contraseña <small>(Auth)</small></div>
    <div class="item danger" id="ctxCerrar">Cerrar</div>
  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    import { getDatabase, ref, onValue, update, get, child, query, orderByChild, equalTo, runTransaction, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

    /* ----------  Config del proyecto playtvpro-9a9cc  ---------- */
const firebaseConfig = {
    apiKey: "AIzaSyADcEYKamrewxL8CDA8NmAuRZjp8eZ2XzY",
    authDomain: "femon-play.firebaseapp.com",
    databaseURL: "femon-play-default-rtdb.firebaseio.com",
    projectId: "femon-play",
    storageBucket: "femon-play.firebasestorage.app",
    messagingSenderId: "887768250224",
    appId: "1:63456783638:android:1e18d5484b58fc1411f437"
};


    // Init
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    // UI refs
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const lemail = document.getElementById('lemail');
    const lpass = document.getElementById('lpass');
    const loginMsg = document.getElementById('loginMsg');

    const rows = document.getElementById('rows');
    const emptyState = document.getElementById('emptyState');
    const countBadge = document.getElementById('countBadge');
    const searchInput = document.getElementById('search');
    const authStatus = document.getElementById('authStatus');

    // Context menu refs
    const ctx = document.getElementById('ctx');
    const ctxTitle = document.getElementById('ctxTitle');
    const ctxEditCreditos = document.getElementById('ctxEditCreditos');
    const ctxCambiarPw = document.getElementById('ctxCambiarPw');
    const ctxCerrar = document.getElementById('ctxCerrar');

    let VENDORES = []; // [{uid,email,limiteUsuarios}]
    let FILTERED = [];
    let ctxTarget = null; // vendedor seleccionado para menú

    // ------- Auth gate -------
// Nota: validamos contra /Admin/{uid} y (si existe email) debe coincidir (case-insensitive).
    onAuthStateChanged(auth, async (user)=>{
      if(user){
        authStatus.textContent = `Conectado como ${user.email} — verificando permisos…`;
        btnLogout.style.display = 'inline-flex';
        loginView.style.display = 'none';
        // Ocultamos la app hasta pasar la verificación
        appView.style.display = 'none';

        try{
          const adminSnap = await get(ref(db, `Admin/${user.uid}`));
          const exists = adminSnap.exists();
          const data = adminSnap.val() || {};
          const dbEmail = data?.email ?? data?.correo ?? data?.datos?.email ?? data?.datos?.correo ?? data?.mail ?? null;
          const emailOk = dbEmail ? String(dbEmail).toLowerCase() === String(user.email || '').toLowerCase() : true;

          if(!exists || !emailOk){
            const msg = "Tu cuenta no está habilitada (no figura en /Admin) o el correo no coincide.";
            authStatus.textContent = msg;
            loginMsg.textContent = msg;
            // Cerrar sesión inmediatamente
            await signOut(auth);
            return;
          }

          // Verificación OK -> mostramos app y datos filtrados por idv
          authStatus.textContent = `Conectado como ${user.email}`;
          appView.style.display = '';
          attachShortcuts();
          suscribeVendedores(user);
        }catch(err){
          const msg = "Error de verificación. Intenta nuevamente.";
          authStatus.textContent = msg;
          loginMsg.textContent = msg;
          await signOut(auth);
        }
      }else{
        authStatus.textContent = 'No autenticado';
        btnLogout.style.display = 'none';
        appView.style.display = 'none';
        loginView.style.display = '';
        teardownData();
      }
    });

    btnLogin.addEventListener('click', async ()=>{
      loginMsg.textContent = 'Conectando…';
      try{
        await signInWithEmailAndPassword(auth, lemail.value.trim(), lpass.value);
        loginMsg.textContent = '';
      }catch(err){
        loginMsg.textContent = 'Error: '+(err.code||err.message);
      }
    });

    btnLogout.addEventListener('click', ()=> signOut(auth));

    function teardownData(){
      VENDORES = []; FILTERED = [];
      rows.innerHTML = '';
      countBadge.textContent = '0 vendedores';
    }

    // ------- Data: Realtime DB (Admin) -------
// Solo cargamos vendedores cuyo idv === uid del admin autenticado.
// Usamos query(orderByChild('idv'), equalTo(user.uid)) sobre /Admin.
    function suscribeVendedores(user){
      const q = query(ref(db, 'Admin'), orderByChild('idv'), equalTo(user.uid));
      onValue(q, (snap)=>{
        const data = snap.val() || {};
        const parsed = Object.entries(data).map(([uid, v])=>{
          const idv = v?.idv ?? v?.datos?.idv ?? null;
          if(String(idv||'') !== String(user.uid)) return null; // salvaguarda extra
          const email = v?.email || v?.correo || v?.datos?.email || v?.datos?.correo || v?.mail || uid;
          const limiteUsuarios = Number(v?.limiteUsuarios ?? v?.creditos ?? v?.datos?.limiteUsuarios ?? 0) || 0;
          return { uid, email, limiteUsuarios };
        }).filter(Boolean).sort((a,b)=> a.email.localeCompare(b.email));
        VENDORES = parsed;
        applyFilter(searchInput.value);
      }, (err)=>{
        console.error('onValue error', err);
      });
    }

    // ------- Render (performante) -------
    function render(list){
      countBadge.textContent = `${list.length} ${list.length===1?'vendedor':'vendedores'}`;
      if(list.length===0){
        rows.innerHTML = '';
        emptyState.style.display = '';
        return;
      }
      emptyState.style.display = 'none';
      const frag = document.createDocumentFragment();
      list.forEach((v, i)=>{
        const tr = document.createElement('tr');
        tr.dataset.uid = v.uid;
        tr.dataset.email = v.email;
        tr.dataset.limite = String(v.limiteUsuarios);
        tr.tabIndex = 0;
        tr.innerHTML = `
          <td>${i+1}</td>
          <td>${escapeHtml(v.email)}</td>
          <td><span class="pill">${v.limiteUsuarios}</span></td>
        `;
        attachRowMenuHandlers(tr);
        frag.appendChild(tr);
      });
      rows.replaceChildren(frag);
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    }

    // ------- Search (debounced) -------
    let searchT = null;
    searchInput.addEventListener('input', ()=>{
      clearTimeout(searchT);
      searchT = setTimeout(()=> applyFilter(searchInput.value), 120);
    });

    function applyFilter(q){
      const s = (q||'').trim().toLowerCase();
      FILTERED = !s ? VENDORES : VENDORES.filter(v=> v.email.toLowerCase().includes(s));
      // Render in next frame to keep UI snappy
      requestAnimationFrame(()=> render(FILTERED));
    }

    function attachShortcuts(){
      window.addEventListener('keydown', (e)=>{
        if(e.key === '/' && (e.ctrlKey || e.metaKey)){
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    // ------- Context menu & acciones (con transferencia de créditos) -------
    function attachRowMenuHandlers(tr){
      tr.addEventListener('contextmenu', (e)=>{
        e.preventDefault();
        openMenuAt(e.clientX, e.clientY, tr);
      });
      // Long press for touch
      let longT; const LONG_MS = 520;
      tr.addEventListener('touchstart', (e)=>{
        longT = setTimeout(()=>{
          const t = e.touches[0];
          openMenuAt(t.clientX, t.clientY, tr);
        }, LONG_MS);
      }, {passive:true});
      tr.addEventListener('touchend', ()=> clearTimeout(longT));
      tr.addEventListener('touchmove', ()=> clearTimeout(longT));
    }

    function openMenuAt(x,y,tr){
      ctxTarget = {
        uid: tr.dataset.uid,
        email: tr.dataset.email,
        limiteUsuarios: Number(tr.dataset.limite)||0
      };
      ctxTitle.textContent = ctxTarget.email;
      ctx.style.left = Math.max(12, x) + 'px';
      ctx.style.top = Math.max(12, y) + 'px';
      ctx.style.display = 'block';
    }

    function hideMenu(){ ctx.style.display = 'none'; ctxTarget=null; }

    document.addEventListener('click', (e)=>{
      if(!ctx.contains(e.target)) hideMenu();
    });
    window.addEventListener('blur', hideMenu);

    ctxCerrar.addEventListener('click', hideMenu);

    // Utilidad numérica segura
    function num(v){ const n = Number(v); return Number.isFinite(n)? n : 0; }

    ctxEditCreditos.addEventListener('click', async () => {
    if (!ctxTarget) return;

    const actual = ctxTarget.limiteUsuarios;
    let nuevo = prompt(`Nuevo límite de usuarios para\n${ctxTarget.email}\n(Actual: ${actual})`);

    if (nuevo == null) return; // Cancelado
    
    nuevo = Number(String(nuevo).trim());
    if (!Number.isFinite(nuevo) || nuevo < 0) {
        return alert('El valor debe ser un número positivo.');
    }

    try {
        const me = auth.currentUser;
        if (!me) throw new Error('Sesión no válida');
        
        const delta = nuevo - actual; // La diferencia que vamos a transferir
        
        // Si no hay cambios, no hacemos nada
        if (delta === 0) {
            hideMenu();
            return;
        }

        // --- LÓGICA DE "TRANSACCIÓN MANUAL" PARA DOS NODOS ---

        // 1. Definimos las rutas a los nodos del admin y del vendedor
        const miRef = ref(db, `Admin/${me.uid}/limiteUsuarios`);
        const vendedorRef = ref(db, `Admin/${ctxTarget.uid}/limiteUsuarios`);

        // 2. Leemos los créditos actuales de AMBOS con get()
        const miSnapshot = await get(miRef);
        const misCreditos = miSnapshot.exists() ? Number(miSnapshot.val()) : -1;

        if (misCreditos === -1) {
            return alert("Error: No se encontró tu propio contador de créditos. Operación cancelada.");
        }
        
        // 3. Verificamos si tenemos suficientes créditos para dar (si delta es positivo)
        if (delta > 0 && misCreditos < delta) {
            return alert(`No tienes suficientes créditos. Necesitas ${delta}, pero solo tienes ${misCreditos}.`);
        }

        // 4. Preparamos una sola operación de escritura para actualizar ambos nodos a la vez
        const updates = {};
        
        if (delta > 0) { // Estamos dando créditos
            updates[`Admin/${me.uid}/limiteUsuarios`] = misCreditos - delta;
            updates[`Admin/${ctxTarget.uid}/limiteUsuarios`] = actual + delta;
        } else { // Estamos recibiendo créditos (delta es negativo)
            const aDevolver = -delta;
            updates[`Admin/${me.uid}/limiteUsuarios`] = misCreditos + aDevolver;
            updates[`Admin/${ctxTarget.uid}/limiteUsuarios`] = actual - aDevolver;
        }
        
        // 5. Ejecutamos la actualización atómica
        await update(ref(db), updates);

        hideMenu();
        alert('Créditos actualizados correctamente.');

    } catch (err) {
        console.error("Error al editar créditos:", err);
        alert('No se pudo actualizar: ' + (err.message || err.code));
    }
});

    // Cambiar contraseña vía API protegida por ID token (ejemplo provisto)
    ctxCambiarPw.addEventListener('click', ()=>{
      if(!ctxTarget) return;
      cambiarPw(ctxTarget.uid, ctxTarget.email);
    });

    // ------- API helper provisto por ti -------
    async function cambiarPw(uid,email){
      /* ---------- CORREGIDO: texto del prompt entre back-ticks ---------- */
      let nueva = prompt(`Nueva contraseña para\n${email}:`);
      /* ----------------------------------------------------------------- */
      if(!nueva || !(nueva = nueva.trim())) return alert("Contraseña inválida");

      try{
        const idTok = await auth.currentUser.getIdToken(true);
        const r = await fetch("/api/changePassword",{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer "+idTok
          },
          body: JSON.stringify({ uid, newPassword: nueva })
        });
        const j = await r.json();
        if(!j.success) throw new Error(j.error||"Fallo desconocido");
        alert("Contraseña actualizada correctamente");
        hideMenu();
      }catch(err){
        alert("No se pudo cambiar: "+err.message);
      }
    }
    window.cambiarPw = cambiarPw;

    // Accesibilidad: enfocar primero la app al iniciar sesión
    onAuthStateChanged(auth, (u)=>{
      if(u){ setTimeout(()=> searchInput.focus(), 300); }
    });

    // Primer render limpio
    render([]);
  </script>
</body>
</html>

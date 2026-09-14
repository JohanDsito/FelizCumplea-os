/* ═══════════════════════════════════════════════════════════════════
   LÓGICA DE LA INVITACIÓN
   Para cambiar textos, fecha, lugar o canción edita config.js,
   no este archivo.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var C = window.CONFIG;
  if (!C){ console.error("Falta config.js: la invitación no puede iniciar."); return; }

  var $ = function(id){ return document.getElementById(id); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var INICIO = new Date(C.evento.inicio);
  var FIN    = new Date(C.evento.fin);

  if (isNaN(INICIO)){
    console.error('config.js: "evento.inicio" no es una fecha válida:', C.evento.inicio);
  }

  // iPhone y iPad: son los que más restringen el audio
  var esIOS = /iP(hone|ad|od)/.test(navigator.platform) ||
              (navigator.userAgent.indexOf("Mac") > -1 && "ontouchend" in document);

  /* ══════════════════════════════════════════════════════════
     0 · VOLCAR LA CONFIGURACIÓN EN LA PÁGINA
     El index.html ya trae los textos escritos, para que la
     invitación se vea bien aunque el JavaScript falle. Aquí
     simplemente se sobrescriben con lo que diga config.js.
     ══════════════════════════════════════════════════════════ */
  function texto(id, valor){
    var el = $(id);
    if (el && valor != null) el.textContent = valor;
  }

  function aplicarConfig(){
    var t = C.textos, p = C.persona, e = C.evento, l = C.lugar, m = C.musica;

    // sobre
    texto("txtSobreEncabezado", t.sobreEncabezado);
    texto("txtSobreTitulo",     t.sobreTitulo);
    texto("txtSobrePista",      t.sobrePista);
    texto("txtIniciales",       p.iniciales);

    // fotografía
    var img = $("heroImg");
    if (img){
      img.src = p.foto;
      img.alt = p.fotoAlt;
      img.width  = p.fotoAncho;
      img.height = p.fotoAlto;
      img.style.objectPosition = p.fotoEncuadre;
    }
    texto("txtHeroEncabezado", t.heroEncabezado);
    texto("txtHeroTitulo",     t.heroTitulo);
    texto("txtHeroSubtitulo",  t.heroSubtitulo);

    // dedicatoria
    texto("txtNombre",      p.nombre);
    texto("txtApellido",    p.apellido);
    texto("txtDedicatoria", t.dedicatoria);

    // datos del evento
    texto("txtFecha",     e.fechaTexto);
    texto("txtAnio",      e.anioTexto);
    texto("txtHora",      e.horaTexto);
    texto("txtHoraNota",  e.horaNota);
    texto("txtLugar",     l.nombre);
    texto("txtDireccion", l.direccion);
    texto("txtCiudad",    l.ciudad);

    // enlaces de mapas
    var q = encodeURIComponent(l.busqueda);
    var maps = $("mapsLink"), waze = $("wazeLink");
    if (maps) maps.href = "https://www.google.com/maps/search/?api=1&query=" + q;
    if (waze) waze.href = "https://waze.com/ul?q=" + q + "&navigate=yes";

    // bloque intermedio y cierre
    texto("txtPistaTitulo",     t.pistaTitulo);
    texto("txtPistaTexto",      t.pistaTexto);
    texto("txtCierreFrase",     t.cierreFrase);
    texto("txtCierreTexto",     t.cierreTexto);
    texto("txtFirmaEncabezado", t.firmaEncabezado);
    texto("txtFirma",           t.firma);

    // canción
    texto("txtCancionTitulo",  m.titulo);
    texto("txtCancionArtista", m.artista);

    // título de la pestaña
    document.title = "Una sorpresa para " + p.nombre;

    // colores personalizados (opcionales)
    if (C.colores){
      for (var k in C.colores){
        if (Object.prototype.hasOwnProperty.call(C.colores, k)){
          document.documentElement.style.setProperty(k, C.colores[k]);
        }
      }
    }
  }

  aplicarConfig();

  /* ══════════════════════════════════════════════════════════
     1 · MÚSICA
     ──────────────────────────────────────────────────────────
     Los teléfonos son mucho más estrictos que un computador:

     · El iPhone, con el interruptor lateral en silencio, calla
       cualquier etiqueta <audio> normal. La forma de sortearlo es
       hacer pasar el sonido por la Web Audio API, que se enruta
       por el canal de reproducción y sí suena.
     · iOS y Android exigen que play() se llame de forma
       inmediata dentro del toque, sin ningún paso intermedio.
     · En datos móviles ignoran preload="auto", así que al tocar
       el sello la canción puede no estar descargada todavía.

     Por eso el orden de abajo es estricto, y si aun así no suena
     se muestra un aviso para intentarlo de nuevo.
     ══════════════════════════════════════════════════════════ */
  var audio    = $("audio");
  var fab      = $("fab");
  var playBtn  = $("playBtn");
  var seek     = $("seek");
  var elapsed  = $("elapsed");
  var total    = $("total");
  var musicSec = $("musicSec");
  var rescate  = $("audioRescue");

  var sonando  = false;
  var buscando = false;          // el usuario arrastra la barra
  var ctx = null, gain = null;   // Web Audio
  var webAudioListo = false;

  var VOLUMEN = C.musica.volumen != null ? C.musica.volumen : 0.85;
  var FUNDIDO = C.musica.fundidoEntradaSegundos || 0;

  audio.src     = C.musica.archivo;
  audio.loop    = C.musica.repetir !== false;
  audio.volume  = VOLUMEN;
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");   // iOS: no abrir pantalla completa

  /* Enruta el sonido por la Web Audio API.
     Debe llamarse DENTRO del toque del usuario, nunca antes. */
  function prepararWebAudio(){
    if (webAudioListo) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try{
      ctx  = new AC();
      var fuente = ctx.createMediaElementSource(audio);
      gain = ctx.createGain();
      gain.gain.value = VOLUMEN;
      fuente.connect(gain);
      gain.connect(ctx.destination);
      webAudioListo = true;
      return true;
    }catch(e){
      // si algo falla se sigue con el audio normal
      ctx = null; gain = null; webAudioListo = false;
      log("Web Audio no disponible: " + e.name);
      return false;
    }
  }

  function subirVolumenGradual(){
    if (FUNDIDO <= 0 || reduced){
      if (gain) gain.gain.value = VOLUMEN; else audio.volume = VOLUMEN;
      return;
    }
    if (webAudioListo && ctx){
      // en el iPhone audio.volume se ignora, pero el nodo de ganancia sí responde
      var t0 = ctx.currentTime;
      gain.gain.cancelScheduledValues(t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(VOLUMEN, t0 + FUNDIDO);
    } else {
      audio.volume = 0;
      var ini = performance.now();
      var subir = function(now){
        var k = Math.min((now - ini) / (FUNDIDO * 1000), 1);
        audio.volume = VOLUMEN * k;
        if (k < 1) requestAnimationFrame(subir);
      };
      requestAnimationFrame(subir);
    }
  }

  /* El camino crítico. Se llama siempre desde un toque del usuario. */
  function intentarReproducir(conFundido){
    prepararWebAudio();
    if (ctx && ctx.state === "suspended") ctx.resume();   // iOS lo exige aquí

    if (conFundido) subirVolumenGradual();
    else if (gain) gain.gain.value = VOLUMEN;
    else audio.volume = VOLUMEN;

    var intento = audio.play();                            // sin nada async antes

    if (intento && intento.then){
      intento.then(function(){ vigilarQueSuene(); })
             .catch(function(err){
               log("play() rechazado: " + (err && err.name));
               mostrarRescate(err && err.name);
             });
    } else {
      vigilarQueSuene();
    }
  }

  /* Que play() no falle no garantiza que se oiga: en el iPhone en
     silencio la reproducción "avanza" sin sonido audible. Aquí al
     menos se detecta cuando ni siquiera avanza. */
  function vigilarQueSuene(){
    var t0 = audio.currentTime;
    setTimeout(function(){
      if (audio.paused || audio.currentTime === t0){
        log("la reproducción no avanzó");
        mostrarRescate("stalled");
      } else {
        ocultarRescate();
      }
    }, 1400);
  }

  function mostrarRescate(motivo){
    marcarEstado(false);
    $("audioRescueHint").textContent = esIOS
      ? "Revisa el interruptor lateral de silencio"
      : "Tu teléfono bloqueó el sonido · súbele el volumen";
    rescate.hidden = false;
    log("rescate visible (" + motivo + ")");
  }

  function ocultarRescate(){ rescate.hidden = true; }

  rescate.addEventListener("click", function(){
    ocultarRescate();
    intentarReproducir(false);
  });

  function mmss(seg){
    if (!isFinite(seg) || seg < 0) return "0:00";
    var m = Math.floor(seg / 60), s = Math.floor(seg % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function pintarProgreso(){
    if (!isFinite(audio.duration) || buscando) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    seek.style.setProperty("--pct", pct + "%");
    elapsed.textContent = mmss(audio.currentTime);
    seek.setAttribute("aria-valuetext", mmss(audio.currentTime) + " de " + mmss(audio.duration));
  }

  function marcarEstado(v){
    sonando = v;
    fab.dataset.playing = playBtn.dataset.playing = v ? "1" : "0";
    var etiqueta = v ? "Pausar la música" : "Reproducir la música";
    fab.setAttribute("aria-label", etiqueta);
    playBtn.setAttribute("aria-label", etiqueta);
    musicSec.classList.toggle("playing", v);
  }

  function alternar(){
    if (audio.paused) intentarReproducir(false);
    else audio.pause();
  }

  audio.addEventListener("play",  function(){ marcarEstado(true);  });
  audio.addEventListener("playing", function(){ marcarEstado(true); ocultarRescate(); });
  audio.addEventListener("pause", function(){ marcarEstado(false); });
  audio.addEventListener("timeupdate", pintarProgreso);
  audio.addEventListener("loadedmetadata", function(){
    total.textContent = mmss(audio.duration);
    pintarProgreso();
  });
  audio.addEventListener("ended", function(){ if (!audio.loop) marcarEstado(false); });
  audio.addEventListener("error", function(){
    musicSec.classList.add("failed");
    var e = audio.error;
    log("error de audio: código " + (e && e.code));
    console.error("No se pudo cargar el audio:", C.musica.archivo);
  });

  fab.addEventListener("click", alternar);
  playBtn.addEventListener("click", alternar);

  // al volver de segundo plano el iPhone suspende el contexto de audio
  document.addEventListener("visibilitychange", function(){
    if (!document.hidden && ctx && ctx.state === "suspended" && sonando) ctx.resume();
  });

  // barra de progreso
  seek.addEventListener("input", function(){
    buscando = true;
    seek.style.setProperty("--pct", seek.value + "%");
    if (isFinite(audio.duration)) elapsed.textContent = mmss(audio.duration * seek.value / 100);
  });
  seek.addEventListener("change", function(){
    if (isFinite(audio.duration)) audio.currentTime = audio.duration * seek.value / 100;
    buscando = false;
  });

  /* ══════════════════════════════════════════════════════════
     2 · APERTURA DEL SOBRE
     ══════════════════════════════════════════════════════════ */
  var veil = $("veil"), openBtn = $("openBtn"), page = $("page");
  var abierto = false;

  // mientras el sobre esté cerrado, la página de atrás no debe recibir foco
  // (se aplica desde JS: si el script falla, la invitación sigue siendo usable)
  page.inert = true;

  // si la canción tarda en descargar, se avisa en lugar de dejar el sobre mudo
  var avisoCarga = setTimeout(function(){
    if (audio.readyState < 3) $("envLoading").classList.add("on");
  }, 2500);
  audio.addEventListener("canplay", function(){
    clearTimeout(avisoCarga);
    $("envLoading").classList.remove("on");
  });

  function abrir(){
    if (abierto) return;
    abierto = true;
    clearTimeout(avisoCarga);

    // lo primero, sin nada por delante: los móviles solo lo permiten aquí
    intentarReproducir(true);

    veil.classList.add("opening");
    if (C.efectos.confeti && !reduced) confeti();

    setTimeout(function(){
      veil.classList.add("gone");
      page.inert = false;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = "";
      revelar();
      setTimeout(function(){ fab.classList.add("on"); }, 700);
    }, reduced ? 60 : 1150);
  }

  openBtn.addEventListener("click", abrir);
  veil.addEventListener("click", function(e){ if (e.target === veil) abrir(); });

  /* ══════════════════════════════════════════════════════════
     3 · AGENDAR (.ics) — se genera en el navegador, sin servidor
     ══════════════════════════════════════════════════════════ */
  function fechaICS(dt){ return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; }
  function escapar(s){ return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); }

  $("icsBtn").addEventListener("click", function(){
    var titulo = "Cumpleaños de " + C.persona.nombre + " " + C.persona.apellido;
    var sitio  = C.lugar.nombre + ", " + C.lugar.direccion + ", " + C.lugar.ciudad;
    var horas  = C.evento.recordatorioHorasAntes || 2;

    var cuerpo = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Portal Cumpleanos//ES","CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@invitacion",
      "DTSTAMP:" + fechaICS(new Date()),
      "DTSTART:" + fechaICS(INICIO),
      "DTEND:"   + fechaICS(FIN),
      "SUMMARY:"     + escapar(titulo),
      "LOCATION:"    + escapar(sitio),
      "DESCRIPTION:" + escapar(C.textos.pistaTexto),
      "BEGIN:VALARM","TRIGGER:-PT" + horas + "H","ACTION:DISPLAY",
      "DESCRIPTION:" + escapar(titulo),
      "END:VALARM","END:VEVENT","END:VCALENDAR"
    ].join("\r\n");

    var url = URL.createObjectURL(new Blob([cuerpo], { type:"text/calendar;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "cumpleanos-" + C.persona.nombre.toLowerCase().replace(/\s+/g, "-") + ".ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    aviso("Evento descargado · ábrelo para agendarlo");
  });

  /* ══════════════════════════════════════════════════════════
     4 · COMPARTIR
     ══════════════════════════════════════════════════════════ */
  $("shareBtn").addEventListener("click", async function(){
    var datos = {
      title: C.textos.compartirTitulo,
      text : C.textos.compartirTexto,
      url  : location.href
    };
    if (navigator.share){
      try { await navigator.share(datos); return; }
      catch(e){ if (e && e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(location.href);
      aviso("Enlace copiado");
    } catch(e){
      aviso("Copia el enlace desde la barra del navegador");
    }
  });

  var temporizadorAviso;
  function aviso(msg){
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function(){ t.classList.remove("show"); }, 3200);
  }

  /* ══════════════════════════════════════════════════════════
     5 · REVELADO AL HACER SCROLL
     ══════════════════════════════════════════════════════════ */
  function revelar(){
    var items = document.querySelectorAll(".rv");
    if (reduced || !("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en, i){
        if (!en.isIntersecting) return;
        setTimeout(function(){ en.target.classList.add("in"); }, i * 110);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    items.forEach(function(el){ io.observe(el); });
  }

  /* ══════════════════════════════════════════════════════════
     6 · CONFETI
     ══════════════════════════════════════════════════════════ */
  function confeti(){
    var host = $("confetti");
    var paleta = ["#D9B86A","#B8862F","#B0173F","#F4E9D7","#8C0F31"];
    var trozo = document.createDocumentFragment();
    var n = C.efectos.confetiPiezas || 46;

    for (var i = 0; i < n; i++){
      var p = document.createElement("i");
      p.className = "conf";
      p.style.left = (Math.random() * 100) + "vw";
      p.style.background = paleta[i % paleta.length];
      p.style.animationDuration = (2.6 + Math.random() * 2.4) + "s";
      p.style.animationDelay = (Math.random() * 1.1) + "s";
      if (i % 3 === 0){ p.style.borderRadius = "50%"; p.style.height = "8px"; }
      trozo.appendChild(p);
    }
    host.appendChild(trozo);
    setTimeout(function(){ host.innerHTML = ""; }, 7200);
  }

  /* ══════════════════════════════════════════════════════════
     7 · DIAGNÓSTICO
     Añade ?debug al final del enlace para ver, en el propio
     teléfono, por qué no está sonando la música.
     Ejemplo:  https://tusitio.com/?debug
     ══════════════════════════════════════════════════════════ */
  var DEBUG = /[?&]debug\b/.test(location.search);
  var registro = [];

  function log(msg){
    registro.push(msg);
    if (DEBUG) pintarDebug();
  }

  function pintarDebug(){
    var d = $("debug");
    var e = audio.error;
    var estados = ["0 vacío","1 metadatos","2 datos actuales","3 datos futuros","4 completo"];
    d.textContent = [
      "DIAGNÓSTICO DE AUDIO",
      "─────────────────────────",
      "archivo    : " + C.musica.archivo,
      "carga      : " + (estados[audio.readyState] || audio.readyState),
      "red        : " + audio.networkState + (audio.networkState === 3 ? " (sin fuente)" : ""),
      "error      : " + (e ? "código " + e.code : "ninguno"),
      "pausado    : " + audio.paused,
      "segundo    : " + audio.currentTime.toFixed(1) + " / " + (isFinite(audio.duration) ? audio.duration.toFixed(0) : "?"),
      "volumen    : " + audio.volume.toFixed(2) + (audio.muted ? " (SILENCIADO)" : ""),
      "web audio  : " + (webAudioListo ? (ctx ? ctx.state : "?") : "no activa"),
      "ganancia   : " + (gain ? gain.gain.value.toFixed(2) : "—"),
      "iOS        : " + esIOS,
      "─────────────────────────",
      registro.slice(-8).join("\n") || "(sin incidencias)"
    ].join("\n");
  }

  if (DEBUG){
    $("debug").hidden = false;
    pintarDebug();
    setInterval(pintarDebug, 600);
  }
})();
